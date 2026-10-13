import fs from 'fs';
import crypto from 'crypto';

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function writePackage(dir, baseName, data) {
  const contentStr = JSON.stringify(data, null, 2) + '\n';
  const hash = sha256(contentStr);
  const filePath = `${dir}/${baseName}.${hash}.json`;
  fs.writeFileSync(filePath, contentStr);
  return { path: filePath, hash, size: Buffer.byteLength(contentStr) };
}

fs.mkdirSync('biblia/43', { recursive: true });
fs.mkdirSync('camada1/refs', { recursive: true });
fs.mkdirSync('camada2/43', { recursive: true });

const pkgBiblia = writePackage('biblia/43', '003', {
  schemaVersion: 'pv-biblia-v1',
  bookId: '43',
  bookName: 'João',
  chapter: 3,
  _teste: true,
  verses: [
    { verse: 16, text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna. [Texto de teste]' }
  ]
});

const pkgCamada1Refs = writePackage('camada1/refs', '43', {
  schemaVersion: 'pv-camada1-v1',
  id: '43',
  type: 'camada1-refs',
  _teste: true,
  bookId: '43',
  bookName: 'João',
  introduction: 'Introdução de teste ao Evangelho segundo João.',
  crossReferences: [
    {
      fromVerse: '43-003-016',
      targets: ['45-005-008', '62-004-009']
    }
  ]
});

const pkgCamada1Trilha = writePackage('camada1', 'trilha', {
  schemaVersion: 'pv-camada1-v1',
  id: 'trilha-evangelho',
  type: 'camada1-trilha',
  _teste: true,
  title: 'A História de Jesus em 9 Passos (Teste)',
  steps: [
    {
      stepNumber: 1,
      title: 'Criação',
      verses: [
        { reference: 'Gn 1:27', text: 'Criou Deus o homem à sua imagem...' }
      ]
    }
  ]
});

const pkgCamada2 = writePackage('camada2/43', 'passagem-003-016', {
  schemaVersion: 'pv-camada2-v1',
  contractVersion: 'pv-teaching-r4',
  id: '43-003-016',
  passageRef: 'João 3:16',
  _teste: true,
  humanReviewed: false,
  gospelConnectionType: 1,
  openingQuestion: 'Como Deus demonstra o Seu amor pela humanidade? (Pergunta de teste)',
  whatTextSays: 'O texto declara o amor de Deus enviado em Seu Filho. (Texto de teste)',
  gospelConnection: 'Cristo é o Filho unigênito dado para salvação. (Texto de teste)',
  application: 'Crer em Jesus Cristo para ter a vida eterna. (Texto de teste)',
  prayer: 'Senhor Deus, agradecemos por Teu amor em Cristo Jesus. Amém. (Texto de teste)',
  lineage: {
    generator: 'teste-generator',
    auditor1: 'teste-auditor1',
    auditor2: 'teste-auditor2'
  }
});

const pkgCamada3 = writePackage('camada3', 'versiculos', {
  schemaVersion: 'pv-camada3-v1',
  contractVersion: 'pv-teaching-r4',
  id: '43-003-016',
  verseRef: 'João 3:16',
  _teste: true,
  humanReviewed: false,
  studyText: 'Estudo de teste para o versículo chave João 3:16.',
  lineage: {
    generator: 'teste-generator',
    auditor1: 'teste-auditor1',
    auditor2: 'teste-auditor2'
  }
});

const packages = [
  { id: 'biblia-43-003', path: pkgBiblia.path, hash: pkgBiblia.hash, size: pkgBiblia.size, type: 'biblia' },
  { id: 'camada1-refs-43', path: pkgCamada1Refs.path, hash: pkgCamada1Refs.hash, size: pkgCamada1Refs.size, type: 'camada1-refs' },
  { id: 'camada1-trilha', path: pkgCamada1Trilha.path, hash: pkgCamada1Trilha.hash, size: pkgCamada1Trilha.size, type: 'camada1-trilha' },
  { id: 'camada2-43-003-016', path: pkgCamada2.path, hash: pkgCamada2.hash, size: pkgCamada2.size, type: 'camada2-passagem' },
  { id: 'camada3-versiculos', path: pkgCamada3.path, hash: pkgCamada3.hash, size: pkgCamada3.size, type: 'camada3-versiculos' }
];

const contentManifest = {
  schemaVersion: 'pv-manifest-v1',
  contentVersion: '1.0.0-teste',
  generation: 1,
  licenseAttribution: 'Texto Bíblico: Bíblia Livre (CC BY 4.0 Brasil / porbr2018). Referências cruzadas: OpenBible.info (CC BY).',
  packages: packages,
  revoked: []
};

fs.writeFileSync('content-manifest.json', JSON.stringify(contentManifest, null, 2) + '\n');
console.log('Sample content files and content-manifest.json created successfully.');
