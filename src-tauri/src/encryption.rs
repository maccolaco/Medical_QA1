use anyhow::Result;
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use rand::Rng;

pub struct EncryptionService {
    cipher: Aes256Gcm,
}

impl EncryptionService {
    pub fn new(key: &[u8]) -> Result<Self> {
        let key = Key::from_slice(key);
        let cipher = Aes256Gcm::new(key);
        Ok(Self { cipher })
    }

    pub fn generate_key() -> Vec<u8> {
        let mut key = [0u8; 32];
        rand::thread_rng().fill(&mut key);
        key.to_vec()
    }

    pub fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        let nonce = self.generate_nonce();
        let ciphertext = self.cipher.encrypt(&nonce, data)
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;
        
        let mut result = nonce.to_vec();
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    pub fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        if encrypted_data.len() < 12 {
            return Err(anyhow::anyhow!("Invalid encrypted data"));
        }

        let nonce = Nonce::from_slice(&encrypted_data[..12]);
        let ciphertext = &encrypted_data[12..];

        let plaintext = self.cipher.decrypt(nonce, ciphertext)
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

        Ok(plaintext)
    }

    fn generate_nonce(&self) -> Nonce {
        let mut nonce = [0u8; 12];
        rand::thread_rng().fill(&mut nonce);
        Nonce::from_slice(&nonce)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let key = EncryptionService::generate_key();
        let service = EncryptionService::new(&key).unwrap();
        
        let data = b"Hello, World!";
        let encrypted = service.encrypt(data).unwrap();
        let decrypted = service.decrypt(&encrypted).unwrap();
        
        assert_eq!(data, &decrypted[..]);
    }
}

