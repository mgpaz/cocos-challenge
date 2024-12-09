export default () => {
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;
  
    if (!dbHost || !dbUser || !dbPassword || !dbName) {
      throw new Error('Database environment variables are not properly set.');
    }
  
    return {
      database: {
        host: dbHost,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: dbUser,
        password: dbPassword,
        name: dbName,
      },
    };
  };  