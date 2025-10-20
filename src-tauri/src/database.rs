use sqlx::{SqlitePool, Row};
use uuid::Uuid;
use chrono::Utc;
use crate::types::*;
use anyhow::Result;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let database_url = "sqlite:claimsense.db";
        let pool = SqlitePool::connect(database_url).await?;
        
        let db = Database { pool };
        db.migrate().await?;
        Ok(db)
    }

    async fn migrate(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS claims (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                status TEXT NOT NULL,
                extracted_data TEXT NOT NULL,
                validation_results TEXT NOT NULL,
                queue TEXT NOT NULL,
                assigned_to TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                comments TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_login TEXT
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                resource_id TEXT,
                details TEXT,
                created_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn create_claim(&self, claim: &Claim) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO claims (
                id, filename, file_path, status, extracted_data,
                validation_results, queue, assigned_to, created_at, updated_at, comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(claim.id.to_string())
        .bind(&claim.filename)
        .bind(&claim.file_path)
        .bind(serde_json::to_string(&claim.status)?)
        .bind(serde_json::to_string(&claim.extracted_data)?)
        .bind(serde_json::to_string(&claim.validation_results)?)
        .bind(serde_json::to_string(&claim.queue)?)
        .bind(claim.assigned_to.map(|id| id.to_string()))
        .bind(claim.created_at.to_rfc3339())
        .bind(claim.updated_at.to_rfc3339())
        .bind(serde_json::to_string(&claim.comments)?)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_claim(&self, id: &Uuid) -> Result<Option<Claim>> {
        let row = sqlx::query("SELECT * FROM claims WHERE id = ?")
            .bind(id.to_string())
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            Ok(Some(self.row_to_claim(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn get_claims(&self, queue: Option<QueueType>) -> Result<Vec<Claim>> {
        let query = if let Some(queue) = queue {
            sqlx::query("SELECT * FROM claims WHERE queue = ? ORDER BY created_at DESC")
                .bind(serde_json::to_string(&queue)?)
        } else {
            sqlx::query("SELECT * FROM claims ORDER BY created_at DESC")
        };

        let rows = query.fetch_all(&self.pool).await?;
        let mut claims = Vec::new();

        for row in rows {
            claims.push(self.row_to_claim(row)?);
        }

        Ok(claims)
    }

    pub async fn update_claim(&self, claim: &Claim) -> Result<()> {
        sqlx::query(
            r#"
            UPDATE claims SET
                filename = ?, file_path = ?, status = ?, extracted_data = ?,
                validation_results = ?, queue = ?, assigned_to = ?, updated_at = ?, comments = ?
            WHERE id = ?
            "#,
        )
        .bind(&claim.filename)
        .bind(&claim.file_path)
        .bind(serde_json::to_string(&claim.status)?)
        .bind(serde_json::to_string(&claim.extracted_data)?)
        .bind(serde_json::to_string(&claim.validation_results)?)
        .bind(serde_json::to_string(&claim.queue)?)
        .bind(claim.assigned_to.map(|id| id.to_string()))
        .bind(claim.updated_at.to_rfc3339())
        .bind(serde_json::to_string(&claim.comments)?)
        .bind(claim.id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn create_user(&self, user: &User, password_hash: &str) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO users (id, username, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(user.id.to_string())
        .bind(&user.username)
        .bind(&user.email)
        .bind(password_hash)
        .bind(serde_json::to_string(&user.role)?)
        .bind(user.created_at.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_user_by_username(&self, username: &str) -> Result<Option<(User, String)>> {
        let row = sqlx::query("SELECT * FROM users WHERE username = ?")
            .bind(username)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            let user = self.row_to_user(row)?;
            let password_hash = row.try_get::<String, _>("password_hash")?;
            Ok(Some((user, password_hash)))
        } else {
            Ok(None)
        }
    }

    pub async fn get_users(&self) -> Result<Vec<User>> {
        let rows = sqlx::query("SELECT id, username, email, role, created_at, last_login FROM users")
            .fetch_all(&self.pool)
            .await?;

        let mut users = Vec::new();
        for row in rows {
            users.push(self.row_to_user(row)?);
        }

        Ok(users)
    }

    pub async fn log_audit_event(&self, log: &AuditLog) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(log.id.to_string())
        .bind(log.user_id.to_string())
        .bind(&log.action)
        .bind(&log.resource_type)
        .bind(log.resource_id.map(|id| id.to_string()))
        .bind(log.details.as_deref())
        .bind(log.created_at.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_analytics(&self) -> Result<Analytics> {
        let total_claims = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM claims")
            .fetch_one(&self.pool)
            .await?;

        let critical_errors = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM claims WHERE queue = ?"
        )
        .bind(serde_json::to_string(&QueueType::CriticalErrors)?)
        .fetch_one(&self.pool)
        .await?;

        let warnings = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM claims WHERE queue = ?"
        )
        .bind(serde_json::to_string(&QueueType::WarningsOnly)?)
        .fetch_one(&self.pool)
        .await?;

        let approved_claims = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM claims WHERE queue = ?"
        )
        .bind(serde_json::to_string(&QueueType::ApprovedClaims)?)
        .fetch_one(&self.pool)
        .await?;

        Ok(Analytics {
            total_claims,
            critical_errors,
            warnings,
            approved_claims,
            denial_rate: if total_claims > 0 { (critical_errors as f64 / total_claims as f64) * 100.0 } else { 0.0 },
            revenue_protected: approved_claims as f64 * 150.0, // Estimated average claim value
            claims_per_day: vec![], // TODO: Implement daily stats
            error_patterns: vec![], // TODO: Implement error patterns
        })
    }

    fn row_to_claim(&self, row: sqlx::sqlite::SqliteRow) -> Result<Claim> {
        Ok(Claim {
            id: Uuid::parse_str(&row.try_get::<String, _>("id")?)?,
            filename: row.try_get("filename")?,
            file_path: row.try_get("file_path")?,
            status: serde_json::from_str(&row.try_get::<String, _>("status")?)?,
            extracted_data: serde_json::from_str(&row.try_get::<String, _>("extracted_data")?)?,
            validation_results: serde_json::from_str(&row.try_get::<String, _>("validation_results")?)?,
            queue: serde_json::from_str(&row.try_get::<String, _>("queue")?)?,
            assigned_to: row.try_get::<Option<String>, _>("assigned_to")?
                .map(|s| Uuid::parse_str(&s))
                .transpose()?,
            created_at: DateTime::parse_from_rfc3339(&row.try_get::<String, _>("created_at")?)?
                .with_timezone(&Utc),
            updated_at: DateTime::parse_from_rfc3339(&row.try_get::<String, _>("updated_at")?)?
                .with_timezone(&Utc),
            comments: serde_json::from_str(&row.try_get::<String, _>("comments")?)?,
        })
    }

    fn row_to_user(&self, row: sqlx::sqlite::SqliteRow) -> Result<User> {
        Ok(User {
            id: Uuid::parse_str(&row.try_get::<String, _>("id")?)?,
            username: row.try_get("username")?,
            email: row.try_get("email")?,
            role: serde_json::from_str(&row.try_get::<String, _>("role")?)?,
            created_at: DateTime::parse_from_rfc3339(&row.try_get::<String, _>("created_at")?)?
                .with_timezone(&Utc),
            last_login: row.try_get::<Option<String>, _>("last_login")?
                .map(|s| DateTime::parse_from_rfc3339(&s))
                .transpose()?
                .map(|dt| dt.with_timezone(&Utc)),
        })
    }
}

