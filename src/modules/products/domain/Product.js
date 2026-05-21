export default class Product {
  constructor({
    product_id,
    user_id,
    product_name,
    product_price,
    is_active = true,
  }) {
    this.product_id = product_id;
    this.user_id = user_id;
    this.product_name = product_name;
    this.product_price = product_price;
    this.is_active = is_active;
  }
}
