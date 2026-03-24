import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

let pool: mysql.Pool | null = null

export function getDb(): mysql.Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host: config.mysqlHost as string,
      port: Number(config.mysqlPort),
      user: config.mysqlUser as string,
      password: config.mysqlPassword as string,
      database: config.mysqlDatabase as string,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function ensureSchema(): Promise<void> {
  const db = getDb()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
      data       JSON,
      html       LONGTEXT,
      css        LONGTEXT,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      username   VARCHAR(100) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(50)  NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  // Seed default admin user if table is empty
  const [rows] = await db.execute<mysql.RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM users')
  const userCount = Number((rows[0] as { cnt?: number } | undefined)?.cnt ?? 0)
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await db.execute(
      'INSERT INTO users (id, username, password, role) VALUES (UUID(), ?, ?, ?)',
      ['admin', passwordHash, 'admin'],
    )
  }

  // Add published column if missing (backwards-compatible migration)
  const [cols] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'published'`,
  )
  const publishedColCount = Number((cols[0] as { cnt?: number } | undefined)?.cnt ?? 0)
  if (publishedColCount === 0) {
    await db.execute('ALTER TABLE projects ADD COLUMN published TINYINT(1) NOT NULL DEFAULT 0')
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      \`key\`    VARCHAR(500) NOT NULL UNIQUE,
      name       VARCHAR(255) NOT NULL,
      size       INT          NOT NULL DEFAULT 0,
      mime_type  VARCHAR(100) NOT NULL DEFAULT '',
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL UNIQUE,
      slug       VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL UNIQUE,
      slug       VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id          VARCHAR(36)   NOT NULL PRIMARY KEY,
      title       VARCHAR(500)  NOT NULL DEFAULT 'Untitled',
      slug        VARCHAR(500)  NOT NULL UNIQUE,
      content     LONGTEXT,
      excerpt     TEXT,
      category_id VARCHAR(36),
      status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
      cover       VARCHAR(1000),
      created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id VARCHAR(36) NOT NULL,
      tag_id  VARCHAR(36) NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      slug       VARCHAR(100) NOT NULL UNIQUE,
      parent_id  VARCHAR(36),
      sort_order INT          NOT NULL DEFAULT 0,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id             VARCHAR(36)    NOT NULL PRIMARY KEY,
      name           VARCHAR(500)   NOT NULL DEFAULT 'Untitled',
      sku            VARCHAR(200)   UNIQUE,
      slug           VARCHAR(500)   NOT NULL UNIQUE,
      short_desc     TEXT,
      description    LONGTEXT,
      category_id    VARCHAR(36),
      brand          VARCHAR(200),
      status         ENUM('draft','active','discontinued') NOT NULL DEFAULT 'draft',
      unit           VARCHAR(50)    NOT NULL DEFAULT '件',
      price          DECIMAL(12,2),
      min_order_qty  INT            NOT NULL DEFAULT 1,
      cover          VARCHAR(1000),
      images         JSON,
      specs          JSON,
      attachments    JSON,
      weight         DECIMAL(10,3),
      created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_tags (
      product_id VARCHAR(36) NOT NULL,
      tag_id     VARCHAR(36) NOT NULL,
      PRIMARY KEY (product_id, tag_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}
