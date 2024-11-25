const fs = require('fs');
const path = require('path')

// Obtem o nome base do nó removendo "node-red-contrib-" do nome do pacote
const nodeName = (require('../package.json').name || '').replace(/node-red-contrib-/g, '');

// Caminho para o diretório de nós
const nodesPath = path.join(__dirname, 'nodes');

// Função para carregar um nó
function loadNode(nodeFolder) {
  const nodePath = path.join(nodesPath, nodeFolder);

  // Verifica se é um diretório
  if (!fs.statSync(nodePath).isDirectory()) {
    return;
  }

  // Tenta encontrar o arquivo principal com base no nodeName
  const mainFile = fs.readdirSync(nodePath).find(file => file === `${nodeName}.js`);

  if (mainFile) {
    console.log(`Carregando nó: ${nodeFolder} (arquivo principal: ${mainFile})`);
    require(path.join(nodePath, mainFile));
  } else {
    // Fallback: Carrega o primeiro arquivo `.js` encontrado
    const fallbackFile = fs.readdirSync(nodePath).find(file => file.endsWith('.js'));

    if (fallbackFile) {
      console.log(`Carregando nó: ${nodeFolder} (arquivo fallback: ${fallbackFile})`);
      require(path.join(nodePath, fallbackFile));
    } else {
      console.warn(`Nenhum arquivo encontrado para o nó: ${nodeFolder}`);
    }
  }
}

// Carrega todos os nós no diretório
fs.readdirSync(nodesPath).forEach(loadNode);
