import * as fs from 'fs';
import * as path from 'path';


interface SaveAudioOptions {
  audioBase64: string;
  outputPath?: string;
}

export async function saveAudioFromBase64(
  audioBase64: SaveAudioOptions['audioBase64'],
  outputPath: SaveAudioOptions['outputPath'] = 'audio'
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Extrai apenas a parte do Base64 se vier com prefixo
      const base64Data = audioBase64.includes('base64,')
        ? audioBase64.split('base64,')[1]
        : audioBase64;

      // Cria o diretório se não existir
      const dir = path.join(__dirname, '..', '../', 'audios/');

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const fullPath = dir + outputPath + '.ogg';
      // Decodifica o Base64 e escreve no arquivo
      fs.writeFile(fullPath, Buffer.from(base64Data, 'base64'), (err) => {
        if (err) {
          reject(`Erro ao salvar o arquivo: ${err.message}`);
        } else {
          resolve(`${fullPath}`);
        }
        return fullPath;
      });
    } catch (error: any) {
      reject(`Erro ao processar o Base64: ${error.message}`);
    }
  });
}