import {Router} from "express"
import { connection } from "../db.js"
import { createUsuario, returnUsuario, updateUsuarioSchema } from "../schemas/usuario.schemas.js"
import { validateDataMiddleware } from "../middleware/validateData.middleware.js"
import jwt from "jsonwebtoken"

const dadosUsuario = [
    "name","email","password"
]

export const userRoutes = Router()

userRoutes.get("",async (req,res)=>{
    // const users = database.users
    // return res.status(200).json(users)
    const usersDb = await connection.query("select * from usuarios;")
    const users = usersDb.rows
    const returnUsers = users.map((user)=>{
        const obj = {}
        for(const key in user){
           // console.log(key,user[key])
            if(returnUsuario.includes(key)){
                obj[key] = user[key]
            }
        }
        return obj
    })
    return res.status(200).json(returnUsers)
})
userRoutes.post("",validateDataMiddleware(createUsuario), async(req,res)=>{
    
    const infos = Object.keys(req.body)
    if(infos.length < dadosUsuario.length){
        return res.status(403).
        json({message:`Dados inválidos, os dados que devem ser enviados são:
             ${dadosUsuario.map((dado)=>dado)}`})
    }
    const user = req.body
  
    const text = 'INSERT INTO usuarios( name, email, password) VALUES($1, $2,$3) RETURNING *'
    const hash = btoa(user.password)
    const values = [user.name,user.email,hash]
    const query = await  connection.query(text,values)
    // await pool.end()
    const returnUser = {}
    for(const key in query.rows[0]){
        if(returnUsuario.includes(key)){
            returnUser[key] = query.rows[0][key]
        }
    }
    return res.status(201).json(returnUser)
})

userRoutes.delete("/:id",async (req,res)=>{
    const text = 'select * from usuarios where id = $1'
    const values = [req.params.id]
    const findUser = await connection.query(text,values)
      if(findUser.rows.length === 0){
       return res.status(404).json({message:"Usuário não encontrado"})
    }
    const deleteText = 'delete from usuarios where id = $1'
    await connection.query(deleteText,values)
    return res.status(204).send()
})
userRoutes.patch("/:id",validateDataMiddleware(updateUsuarioSchema), async (req,res)=>{
     const text = 'select * from usuarios where id = $1'
    const values = [req.params.id]
    const findUser = await connection.query(text,values)
      if(findUser.rows.length === 0){
       return res.status(404).json({message:"Usuário não encontrado"})
    }
    const oldUser = findUser.rows[0]
    const obj = {}
    for(const key in req.body){
        if(dadosUsuario.includes(key)){
            obj[key] = req.body[key]
        }
    }
    const updateUser = {
        ...oldUser,
        ...obj, 
    }
    const updateQuery = `update usuarios set name = $2,email = $3, password=$4 where id = $1 RETURNING *`
    const uodateValues = [req.params.id,updateUser.name,updateUser.email,updateUser.password]
    const updateUserDb = await connection.query(updateQuery,uodateValues)
    const objUpdate = {}
    for(const key in updateUserDb.rows[0]){
        if(returnUsuario.includes(key)){
            objUpdate[key] = updateUserDb.rows[0][key]
        }
    }
    return res.status(200).json(objUpdate)
})

userRoutes.get("/:retrive",(req,res)=>{
    const token = res.headers.authorization.split(" ") [1]

    jwt.verify(token,process.env.secret_key,(erro,decoded)=>{
        if(erro){
            return res.status(401).json({message:"token inválido"})
        }
        return res.status(200).json(...decoded)
    })
})
userRoutes.get("/:id",async (req,res)=>{
    const text = 'select * from usuarios where id = $1'
    const values = [req.params.id]
    const findUser = await connection.query(text,values)
    console.log(findUser,"findUSer")
    if(findUser.rows.length === 0){
       return res.status(404).json({message:"Usuário não encontrado"})
    }
    const user = findUser.rows[0]
    const obj = {}
    for(const key in user){
        if(returnUsuario.includes(key)){
            obj[key] = user[key]
        }
    }
    return res.status(200).json(obj)
    
})