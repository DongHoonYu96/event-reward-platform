import {Controller, Get, HttpException, HttpStatus} from '@nestjs/common';
import { AppService } from './app.service';
import {IsPublic} from "./common/decorators/is-public.decorator";
import axios from "axios";

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IsPublic()
  @Get('/AUTH-SERVICE/api-json')
  async getAuthServiceSwagger(): Promise<any> {
    try {
      const response = await axios.get(`http://localhost:3001/api-json`);

      if (!response.data) {
        throw new HttpException(
            'Failed to fetch Swagger documentation',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const swaggerDoc = response.data;

      // Swagger 버전 확인 및 수정
      if (!swaggerDoc.swagger && !swaggerDoc.openapi) {
        swaggerDoc.swagger = '2.0';
      }

      return swaggerDoc;
    } catch (error) {
      throw new HttpException(
          `Failed to fetch Swagger documentation: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @IsPublic()
  @Get('/EVENT-SERVICE/api-json')
  async getEventServiceSwagger(): Promise<any> {
    try {
      const response = await axios.get(`http://localhost:3002/api-json`);

      if (!response.data) {
        throw new HttpException(
            'Failed to fetch Swagger documentation',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const swaggerDoc = response.data;

      // Swagger 버전 확인 및 수정
      if (!swaggerDoc.swagger && !swaggerDoc.openapi) {
        swaggerDoc.swagger = '2.0';
      }

      return swaggerDoc;
    } catch (error) {
      throw new HttpException(
          `Failed to fetch Swagger documentation: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
