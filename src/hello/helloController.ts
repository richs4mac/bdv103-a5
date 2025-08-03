import {
  Controller,
  Get,
  Path,
  Route
} from 'tsoa'

@Route('hello')
export class HelloController extends Controller {
  @Get('{name}')
  public getHello (
    @Path() name: string
  ): string {
    return `Hello ${name}`
  }
}
