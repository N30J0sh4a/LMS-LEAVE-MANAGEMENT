const crypto = require('crypto');

const AES_KEY = process.env.AES_SECRET_KEY;

function encrypt(plaintext){
    if (!plaintext || plaintext === '') return plaintext;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(AES_KEY, 'hex'),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf-8'),
        cipher.final()
    ]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(ciphertext){
    if (!ciphertext || ciphertext === '') return ciphertext;

    const [ivHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(AES_KEY, 'hex'),
        iv
    );

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);
    return decrypted.toString('utf-8');
}

module.exports = {encrypt, decrypt};