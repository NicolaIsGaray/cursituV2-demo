const fs = require('fs');
const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
  production: true,
  api: '${process.env.ANGULAR_API_URL || 'https://cursituv2-demo.onrender.com/api'}',
  apiUrl: '${process.env.ANGULAR_API_URL || 'https://cursituv2-demo.onrender.com/api'}'
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  }
  console.log(`Environment generado correctamente en ${targetPath}`);
});
