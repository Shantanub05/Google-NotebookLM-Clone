import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateSessionDto } from '../../common/dto/chat.dto';

@Controller('api/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private chatService: ChatService) {}

  /**
   * Create a new chat session
   */
  @Post('session')
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    try {
      const session = this.chatService.createSession(
        createSessionDto.documentId,
      );

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to create session',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send a message and get AI response
   */
  @Post()
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      this.logger.log(`Sending message to session ${sendMessageDto.sessionId}`);

      const response = await this.chatService.sendMessage(
        sendMessageDto.sessionId,
        sendMessageDto.documentId,
        sendMessageDto.message,
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to send message',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get chat history for a session
   */
  @Get(':sessionId/history')
  async getChatHistory(@Param('sessionId') sessionId: string) {
    try {
      const history = this.chatService.getHistory(sessionId);

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to get chat history',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Clear chat history for a session
   */
  @Delete(':sessionId/history')
  async clearHistory(@Param('sessionId') sessionId: string) {
    try {
      this.chatService.clearHistory(sessionId);

      return {
        success: true,
        message: 'Chat history cleared successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to clear history',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a chat session
   */
  @Delete(':sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    try {
      this.chatService.deleteSession(sessionId);

      return {
        success: true,
        message: 'Session deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to delete session',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
