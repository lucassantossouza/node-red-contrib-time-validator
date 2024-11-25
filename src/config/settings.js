module.exports = {
  uiPort: process.env.PORT || 1880,
  userDir: "./data", // Diretório para fluxos e credenciais
  nodesDir: "./src/nodes", // Diretório para nós customizados
  logging: {
      console: {
          level: "debug", // Nível de log para desenvolvimento
          metrics: false,
          audit: false
      }
  }
};
