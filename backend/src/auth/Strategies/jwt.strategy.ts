import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt')
{
    constructor(){
        super ({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey : process.env.JWT_SECRET,
            })
    }

    validate (payload : any)
    {

        return {
            id : payload.sub,
            login : payload.login
        }
    }
}