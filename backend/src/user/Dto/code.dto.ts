import { IsNotEmpty, Length } from "class-validator";

export class CodeDTO {
    @Length(4)
    code : string;
}