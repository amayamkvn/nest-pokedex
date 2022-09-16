import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Pokemon extends Document {

    // id: string // Mongo ya lo otorga 

    @Prop({
        unique: true,
        index: true,
    })
    no: number;

    @Prop({ //Con este decorador definimos propiedades
        unique: true,
        index: true,
    })
    name: string;
}

export const PokemonSchema = SchemaFactory.createForClass( Pokemon ); //Schema que dicta las definiciones y reglas que se deben usar al iniciarse
