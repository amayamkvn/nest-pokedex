import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name ) //Necesita buscar el nombre para saber como manejar el modelo o que inyectar
    private readonly pokemonModel: Model<Pokemon>, //Inyeccion de dependencias desde la entity
  ) {}

  //Método para crear un pokemon
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{
      const pokemon = await this.pokemonModel.create( createPokemonDto ); //creamos un nuevo modelo y mandamos la data del Dto
      return pokemon;
  
    } catch(error){
      this.handleException(error);
    }
    
  }

  findAll() {
    return `This action returns all pokemon`;
  }


  //Método para buscar un pokemon, ya sea por el id, el name o el numero de pokemon
  async findOne(term: string ) { //La variable term va a recibir el termino de busqueda
    let pokemon: Pokemon; //Referencia al entity

    //Busqueda por 'no'
    if( !isNaN(+term)){ //Si esto es un número
      pokemon = await this.pokemonModel.findOne({ no: term }); //Aquí extraemos el termino por el cual se realiza la busqueda, 'no' es el campo de numero de pokemon en la base de datos
    }

    //Busqueda por 'MongoId'
    if( !pokemon && isValidObjectId( term )){ //Si no hemos encontrado un pokemon y term esto es un un objeto de mongo
      pokemon = await this.pokemonModel.findById( term ); 
    }

    //Busqueda por 'Name'
    if( !pokemon ){ //Si no hemos encontrado ningún pokemon entonces buscaremos por el nombre
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() }); //'name' es el campo de nombre de pokemon en la base de datos, el .trim() elimina los espacios de adelante o de atras 
    }

    //Error en caso de not found
    if ( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no "${term} not found"`); //Si el pokemon no fue encontrado lanzar un error de not found

    return pokemon;
  }


  //Método para actualizar un pokemon
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    try{
      const pokemon = await this.findOne( term ); //Busqueda
      if( updatePokemonDto.name){ //Si recibimos el nombre entonces debemos pasarlo a minusculas porque así guardamos los datos en la db
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase().trim();
      }
      
      await pokemon.updateOne( updatePokemonDto ); //Actualizamos el dato 

      return { ...pokemon.toJSON(), ...UpdatePokemonDto }; //En esta parte retornamos las propiedades del pokemon en forma de JSON y luego sobreescribimos los datos acyaulizados que tiene el Dto
    
    } catch (error){
      this.handleException(error);
    }

  }


  //Método para eliminar un pokemon
  async remove(id: string) {
    // const pokemon = await this.findOne( id ); //Buscamos si existe
    // await pokemon.deleteOne();

    //const result = await this.pokemonModel.findByIdAndDelete( id ); //Busca el id y si lo encuentra procede a eliminarlo

    //const result = await this.pokemonModel.deleteMany({  });//Importante no mandar vacío este campo ya que elemininaría todos los registros
    
    //Deconstruimos la data para obtener el deleteCount de los resultados y poder hacer una operación logica
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id }); //'_id' es el campo de la base de datos y el id es el parametro que estamos recibiendo
    if( deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${ id } not found"`)
    }
    return `Registro eliminado`;
  }


  //Método para el manejo del error 11000
  private handleException(error: any) {
    if (error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server log`);
  }



}
