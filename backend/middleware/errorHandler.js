// Agar koi bhi jagah error aaye, ye centrally pakad leta hai
// Isse har jagah try-catch nahi likhna padta

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Server pe print karo debugging ke liye

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Production mein stack trace mat dikhao
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;