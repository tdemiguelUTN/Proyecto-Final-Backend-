import { sessionsService } from "../services/sessions.service.js";

class SessionsController {
    findUser = async (req, res) => {            //TERMINAR
        try {
            //const userData = req.session.user
            const result = await sessionsService.findUser(); 
            res.status(200).json({ user: result });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    destroySession = async (req, res) => {
        try {
            const result = await sessionsService.
            req.session.destroy(() => res.redirect("/login"));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}

export const sessionsController = new SessionsController();