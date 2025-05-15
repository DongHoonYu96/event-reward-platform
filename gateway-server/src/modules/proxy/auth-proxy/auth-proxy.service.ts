import {Injectable, Inject, HttpException, HttpStatus, Logger} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AuthProxyService {
    private readonly logger = new Logger(AuthProxyService.name);
    constructor(
        private readonly httpService: HttpService,
        @Inject('AUTH_SERVICE_URL') private readonly authServiceUrl: string,
    ) {}

    async forwardRequest(method: string, path: string, body: any = {}, headers: any = {}, query: any = {}) {
        const url = `${this.authServiceUrl}/${path}`;
        this.logger.log(`[AuthProxyService] forwardRequest: ${method} ${url}`);
        this.logger.debug(`Request body: ${JSON.stringify(body)}`); // 요청 본문 로깅

        // 메서드 정규화
        const normalizedMethod = method.toUpperCase();

        try {
            const response = await lastValueFrom(
                this.httpService.request({
                    method: normalizedMethod,
                    url,
                    data: ['GET', 'HEAD'].includes(normalizedMethod) ? undefined : body, // GET/HEAD 요청에는 body 제외
                    headers,
                    params: query,
                    timeout: 30000, // 30초 타임아웃 명시
                }).pipe(
                    map(response => {
                        this.logger.debug(`Response received: Status ${response.status}`);
                        return response.data;
                    }),
                    catchError(error => {
                        this.logger.error(`Request failed: ${error.message}`);

                        // 요청이 Auth 서버에 도달하지 못한 경우 (네트워크 오류)
                        if (!error.response) {
                            // 연결 거부 오류 (서버가 실행되지 않음)
                            if (error.code === 'ECONNREFUSED') {
                                this.logger.error(`Connection refused: ${this.authServiceUrl}`);
                                throw new HttpException(
                                    `Auth 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요 (${this.authServiceUrl}).`,
                                    HttpStatus.BAD_GATEWAY,
                                );
                            }

                            // 타임아웃 오류
                            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                                this.logger.error(`Request timed out: ${this.authServiceUrl}`);
                                throw new HttpException(
                                    '요청 시간이 초과되었습니다. 나중에 다시 시도하세요.',
                                    HttpStatus.GATEWAY_TIMEOUT,
                                );
                            }

                            // 기타 네트워크 오류
                            this.logger.error(`Network error: ${error.code} - ${error.message}`);
                            throw new HttpException(
                                `인증 서비스 연결 중 오류 발생: ${error.message}`,
                                HttpStatus.BAD_GATEWAY,
                            );
                        }

                        // Auth 서버에서 오류 응답을 받은 경우
                        this.logger.error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                        throw new HttpException(
                            error.response.data,
                            error.response.status,
                        );
                    }),
                ),
            );

            this.logger.debug(`Response data: ${JSON.stringify(response)}`);
            return response;
        } catch (error) {
            this.logger.error(`Unhandled error in forwardRequest: ${error.message}`);
            throw error;
        }
    }
}
