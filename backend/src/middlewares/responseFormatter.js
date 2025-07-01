module.exports = (req, res, next)=>{
    res.success = (data, status=200, message="Success")=>{
        return res.status(status).json({message, data})
    }
    res.error = (status=500, message="Something went wrong")=>{
        return res.status(status).json({message})
    }

    next();
}