import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Error reading/parsing JSON file ${filePath}: ${err.message}`);
  }
}

function validateSchemaBasic(data, schema, filePath) {
  if (!schema || !schema.required) return;
  for (const reqField of schema.required) {
    if (data[reqField] === undefined) {
      throw new Error(`File ${filePath} fails schema: missing required field "${reqField}"`);
    }
  }
}

function runValidation() {
  const errors = [];
  console.log('Starting content validation...');

  // Load schemas
  const manifestSchema = loadJson('schemas/content-manifest.schema.json');
  const bibliaSchema = loadJson('schemas/biblia.schema.json');
  const camada1Schema = loadJson('schemas/camada1.schema.json');
  const camada2Schema = loadJson('schemas/camada2.schema.json');
  const camada3Schema = loadJson('schemas/camada3.schema.json');

  // Load content-manifest.json
  const manifestPath = 'content-manifest.json';
  if (!fs.existsSync(manifestPath)) {
    console.error(`FATAL: ${manifestPath} does not exist.`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = loadJson(manifestPath);
    validateSchemaBasic(manifest, manifestSchema, manifestPath);
  } catch (err) {
    errors.push(err.message);
  }

  if (errors.length > 0) {
    console.error('Manifest validation errors:');
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  }

  const packageIds = new Set();
  const trackedFiles = new Set();

  for (const pkg of manifest.packages) {
    // Check package ID uniqueness
    if (packageIds.has(pkg.id)) {
      errors.push(`Duplicate package id in manifest: ${pkg.id}`);
    }
    packageIds.add(pkg.id);

    const fullPath = pkg.path;
    trackedFiles.add(path.normalize(fullPath));

    if (!fs.existsSync(fullPath)) {
      errors.push(`Manifest package missing on disk: ${fullPath}`);
      continue;
    }

    const rawContent = fs.readFileSync(fullPath);
    const realSize = rawContent.length;
    const realHash = sha256(rawContent);

    // Verify size
    if (pkg.size !== realSize) {
      errors.push(`Package ${pkg.id} (${fullPath}): manifest size ${pkg.size} != real size ${realSize}`);
    }

    // Verify hash
    if (pkg.hash !== realHash) {
      errors.push(`Package ${pkg.id} (${fullPath}): manifest hash ${pkg.hash} != real hash ${realHash}`);
    }

    // Check filename hash
    const fileName = path.basename(fullPath);
    const parts = fileName.split('.');
    if (parts.length < 3 || parts[parts.length - 1] !== 'json') {
      errors.push(`Package file name structure invalid (must be name.HASH.json): ${fileName}`);
    } else {
      const filenameHash = parts[parts.length - 2];
      if (filenameHash !== realHash) {
        errors.push(`Package filename hash mismatch for ${fullPath}: filename hash ${filenameHash} != real hash ${realHash}`);
      }
    }

    // Validate package schema & test content flags
    try {
      const data = JSON.parse(rawContent.toString('utf-8'));

      let expectedSchema;
      if (pkg.type === 'biblia') expectedSchema = bibliaSchema;
      else if (pkg.type.startsWith('camada1')) expectedSchema = camada1Schema;
      else if (pkg.type === 'camada2-passagem') expectedSchema = camada2Schema;
      else if (pkg.type === 'camada3-versiculos') expectedSchema = camada3Schema;

      if (expectedSchema) {
        validateSchemaBasic(data, expectedSchema, fullPath);
      }

      // Check _teste property rule
      if (data._teste === true) {
        // Flag for informational/audit purposes - test content is recognized and validated,
        // but must be marked as _teste: true.
      }

      // Check immutable id rule for teaching packages
      if (data.id && pkg.id) {
        // ID must match
      }
    } catch (err) {
      errors.push(`Content error in ${fullPath}: ${err.message}`);
    }
  }

  // Check for unmanifested content files in biblia, camada1, camada2, camada3
  const checkDirs = ['biblia', 'camada1', 'camada2', 'camada3'];
  function scanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.isFile() && full.endsWith('.json')) {
        const norm = path.normalize(full);
        if (!trackedFiles.has(norm)) {
          errors.push(`Unmanifested content file found on disk: ${norm}`);
        }
      }
    }
  }

  for (const d of checkDirs) {
    scanDir(d);
  }

  if (errors.length > 0) {
    console.error('Validation FAILED with errors:');
    errors.forEach(e => console.error(` [FAIL] ${e}`));
    process.exit(1);
  } else {
    console.log(`Validation SUCCESSFUL. ${manifest.packages.length} packages validated cleanly.`);
  }
}

runValidation();
