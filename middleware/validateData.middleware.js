
export const validateDataMiddleware=(schema=[])=>(req,res,next)=>{
    console.log(req.body, "req do middleware")
    const obj = {}
    for(const key in req.body){
        if(schema.includes(key)){
            obj[key] = req.body[key]
        }
    }
    req.body = obj
    next()
}