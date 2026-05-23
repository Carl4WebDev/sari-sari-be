import db from "../../../core/database/db.js";

export default class ProductRepo {
  async create(product) {
    const result = await db.query(
      `
      INSERT INTO product_master
      (
        user_id,
        product_name,
        product_price
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [product.user_id, product.product_name, product.product_price],
    );

    return result.rows[0];
  }

  async findAllByUserId(userId) {
    const result = await db.query(
      `
      SELECT
        product_id,
        user_id,
        product_name,
        product_price,
        is_active,
        created_at,
        updated_at
      FROM product_master
      WHERE user_id = $1
      AND is_active = TRUE
      ORDER BY product_name ASC
      `,
      [userId],
    );

    return result.rows;
  }

  async findByIdAndUserId(productId, userId) {
    const result = await db.query(
      `
      SELECT *
      FROM product_master
      WHERE product_id = $1
      AND user_id = $2 AND is_active = true
      `,
      [productId, userId],
    );

    return result.rows[0];
  }

  async update(productId, userId, data) {
    const result = await db.query(
      `
      UPDATE product_master
      SET
        product_name = $1,
        product_price = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $3
      AND user_id = $4
      RETURNING *
      `,
      [data.product_name, data.product_price, productId, userId],
    );

    return result.rows[0];
  }

  async deactivate(productId, userId) {
    const result = await db.query(
      `
      UPDATE product_master
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1
      AND user_id = $2
      RETURNING *
      `,
      [productId, userId],
    );

    return result.rows[0];
  }

  async archiveProduct(productId, userId) {
    const result = await db.query(
      `
    UPDATE product_master
    SET is_active = false
    WHERE product_id = $1
      AND user_id = $2
    RETURNING *
    `,
      [productId, userId],
    );

    return result.rows[0];
  }

  async findArchivedByUserId(userId) {
    const result = await db.query(
      `
    SELECT
      product_id,
      user_id,
      product_name,
      product_price,
      is_active,
      created_at,
      updated_at
    FROM product_master
    WHERE user_id = $1
      AND is_active = false
    ORDER BY updated_at DESC, created_at DESC
    `,
      [userId],
    );

    return result.rows;
  }

  async reactivateProduct(productId, userId) {
    const result = await db.query(
      `
    UPDATE product_master
    SET is_active = true
    WHERE product_id = $1
      AND user_id = $2
    RETURNING *
    `,
      [productId, userId],
    );

    return result.rows[0];
  }

  async findByNameAndUserId(productName, userId) {
    const result = await db.query(
      `
    SELECT *
    FROM product_master
    WHERE LOWER(TRIM(product_name)) = LOWER(TRIM($1))
      AND user_id = $2
    LIMIT 1
    `,
      [productName, userId],
    );

    return result.rows[0] || null;
  }
}
