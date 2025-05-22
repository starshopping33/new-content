import {Router} from "express"
import { connection } from "../db.js"
import { validateDataMiddleware } from "../middleware/validateData.middleware.js"
import { createLoginSchema } from "../schemas/login.schemas.js"
import jwt from "jsonwebtoken"
export const loginRoutes = Router()

loginRoutes.post("",validateDataMiddleware(createLoginSchema), async (req,res)=>{
    console.log(req.body,"login")
    const infos = Object.keys(req.body)
    if(infos.length < createLoginSchema.length){
        return res.status(403).json({message:`Dados inválidos, os dados que devem ser enviados são:
             ${createLoginSchema.map((dado)=>dado)}`})
    }
    const text = 'select * from usuarios where email = $1'
    const values = [req.body.email]
    console.log( process.env.secret_key)
    const userDb = await connection.query(text,values)
    const user = userDb.rows[0]
    const descrypt = atob(user.password)
   
    if(descrypt === req.body.password){
        const token = jwt.sign({
            id:user.id,
            email:user.email
        },
        process.env.secret_key,
        {
            expiresIn:"24h",
            subject:String(user.id) 
        }
    )
        return res.status(201).json({...user,token})
        
    }
    return res.status(403).json({message:"E-mail ou senha inválidos"})
})