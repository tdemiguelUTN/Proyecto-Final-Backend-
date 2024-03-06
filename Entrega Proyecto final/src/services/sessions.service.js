import UserDTO from "../persistencia/DTOs/user.dto.js";

class SessionsService{ 
    async findUser(obj) {
        const userSession = req.session.user;
        
        const response = req.session
    }

    async destroySession(obj) {

    }
}

export const sessionsService = new SessionsService();