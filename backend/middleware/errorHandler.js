const errorHandler = (error,req,res,next)=>{
    console.log('Error : ', error.message)

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
    message: error.message,
    errors: error.errors || []

    })
}

export default errorHandler;