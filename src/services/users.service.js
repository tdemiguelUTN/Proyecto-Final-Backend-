import { usersManager } from "../persistencia/DAOs/mongoDAO//UsersManager.js"
import { cartsService } from "../services/carts.service.js"
import { hashData } from "../utils.js"
import UserDTO from "../persistencia/DTOs/user.dto.js";
import Mail from "nodemailer/lib/mailer/index.js";

class UsersService {
    async findAll() {
        const response = await usersManager.findAll();
        return response;
    }
    
    async findById(id) {
        const user = await usersManager.findById(id);
        if (!user) throw new Error();
        const response = new UserDTO(user);
        return response;
    }

    async createOne(body) {
        const { password, ...obj } = body;
        const hashedPassword = await hashData(password);
        const createdCart = await cartsService.createCart({});
        const user = await usersManager.createOne({
            ...obj,
            password: hashedPassword,
            cart: createdCart._id
        });
        const response = new UserDTO(user);
        return response;
    }

    async updateOne(id, obj) {
        const user = await usersManager.updateOne(id, obj);
        if (!user) throw new Error();
        const response = new UserDTO(user);
        return response;
    }

    async deleteOne(id) {
        const response = await usersManager.deleteOne(id);
        return response;
    }

    async findByEmail(email) {                                  
        const user = await usersManager.findByEmail(email);
        if (!user) return null;
        const response = new UserDTO(user);
        return response;
    }
}

export const usersService = new UsersService();