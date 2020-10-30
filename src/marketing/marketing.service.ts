import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketingGame } from 'src/entity/marketing-game.entity';
import { getManager } from 'typeorm';
import { CreateGameDto } from './dto/new-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class MarketingService {

    async addGame(createGameDto:CreateGameDto){
        const {game_name , available_after} = createGameDto

        const newGame = new MarketingGame();

        newGame.gameName = game_name;
        newGame.gameAvailableAfter = available_after,
        newGame.createdDate = new Date();
        newGame.status = true;
        newGame.isDeleted = false;

        newGame.save()
    }

    async listGame()
    {
        let [data,count] = await getManager()
				.createQueryBuilder(MarketingGame, "game")
				.where("game.is_delete = false ")
                .getManyAndCount();
        if(!data.length)
        {
            throw new NotFoundException(`Games not found`)
        }

        return {
            data : data , count : count
        }
    }

    async updateGame(id:number , updateGameDto:UpdateGameDto){
        const {game_name , available_after} = updateGameDto

        

        let game = await getManager()
				.createQueryBuilder(MarketingGame, "game")
				.where("game.is_delete = false AND game.id =:id" , {id})
                .getOne();
        if(!game)
        {
            throw new NotFoundException(`Given game id not found`)
        }

        game.gameName = game_name;
        game.gameAvailableAfter = available_after,
        game.updatedDate = new Date();

        game.save()        
    }

    async delete(id:number){
        
        let game = await getManager()
				.createQueryBuilder(MarketingGame, "game")
				.where("game.is_delete = false AND game.id =:id" , {id})
                .getOne();
        if(!game)
        {
            throw new NotFoundException(`Given game id not found`)
        }

        game.isDeleted = true;
        game.updatedDate = new Date();

        game.save()        
    }

}
