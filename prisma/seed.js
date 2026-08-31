const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Sweet Delights Admin",
      email: "admin@sweetdelights.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  console.log("Users created successfully.");

  // Create Categories
  const categoriesData = [
    { name: "Birthday Cakes", slug: "birthday-cakes" },
    { name: "Anniversary Cakes", slug: "anniversary-cakes" },
    { name: "Wedding Cakes", slug: "wedding-cakes" },
    { name: "Custom Cakes", slug: "custom-cakes" },
    { name: "Chocolate Cakes", slug: "chocolate-cakes" },
    { name: "Eggless Cakes", slug: "eggless-cakes" },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categories[cat.slug] = createdCat;
  }

  console.log("Categories created successfully.");

  // Create Coupons
  const couponsData = [
    { code: "SWEET10", discountType: "PERCENTAGE", discountValue: 10, minOrderValue: 500 },
    { code: "DELIGHT20", discountType: "PERCENTAGE", discountValue: 20, minOrderValue: 1000 },
    { code: "FESTIVE500", discountType: "FIXED", discountValue: 500, minOrderValue: 2500 },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({
      data: coupon,
    });
  }
  console.log("Coupons created successfully.");

  // Products Data
  const productsData = [
    {
      name: "Signature Chocolate Truffle Cake",
      description: "Indulge in our classic dark chocolate sponge cake, layered with rich Belgian chocolate ganache and finished with exquisite chocolate shavings. A chocolate lover's absolute dream.",
      price: 999.0,
      stock: 15,
      isFeatured: true,
      categorySlug: "chocolate-cakes",
      images: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Sarah M.", rating: 5, comment: "Absolutely heavenly! The chocolate is so rich and smooth. Will definitely order again!" },
        { authorName: "Rahul K.", rating: 4, comment: "Very moist and delicious. Not overly sweet, which I liked." }
      ]
    },
    {
      name: "Luxury Red Velvet Cake",
      description: "A gorgeous velvety red sponge layered with our signature premium cream cheese frosting and sprinkled with crimson cake crumbs. Soft, fluffy, and perfect for romantic occasions.",
      price: 1200.0,
      stock: 12,
      isFeatured: true,
      categorySlug: "anniversary-cakes",
      images: [
        "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Priya S.", rating: 5, comment: "Perfect balance of flavors. The cream cheese frosting is light and tangy." }
      ]
    },
    {
      name: "Strawberry Cream Delight",
      description: "Vanilla chiffon cake loaded with fresh sliced strawberries and pillowy vanilla whipped cream. Light, airy, and bursting with fresh berry flavors.",
      price: 899.0,
      stock: 8,
      isFeatured: false,
      categorySlug: "birthday-cakes",
      images: [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Amanda T.", rating: 5, comment: "Fresh and fruity. Ideal for afternoon tea celebrations!" }
      ]
    },
    {
      name: "Premium Three-Tier Floral Wedding Cake",
      description: "An elegant, bespoke three-tier cake detailed with beautiful hand-crafted sugar flowers. Layers feature vanilla bean cake with fresh raspberry compote and silky Swiss meringue buttercream.",
      price: 4500.0,
      stock: 3,
      isFeatured: true,
      categorySlug: "wedding-cakes",
      images: [
        "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525257121703-e86e94e4394e?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Jessica & Mark", rating: 5, comment: "This was the centerpiece of our reception. Not only was it stunning to look at, but it tasted incredible!" }
      ]
    },
    {
      name: "Custom Gold Leaf Macaron Cake",
      description: "A custom-designed double-layered drip cake adorned with premium vanilla macarons, fresh berries, and delicate 24k edible gold leaf flakes. Tailored for milestones.",
      price: 2400.0,
      stock: 5,
      isFeatured: true,
      categorySlug: "custom-cakes",
      images: [
        "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Daniel L.", rating: 5, comment: "Stunning aesthetic. Everyone at the party was taking photos!" }
      ]
    },
    {
      name: "Eggless Premium Black Forest Cake",
      description: "A 100% eggless variant of the traditional Black Forest cake. Made with rich cocoa layers, sweet cherry compote, fresh cream, and chocolate flakes. Soft and moist.",
      price: 950.0,
      stock: 20,
      isFeatured: false,
      categorySlug: "eggless-cakes",
      images: [
        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Sanjay D.", rating: 4, comment: "It is hard to find eggless cakes this soft. Excellent work!" }
      ]
    },
    {
      name: "Eggless Pistachio Cardamom Cake",
      description: "A fusion dessert cake combining rich roasted pistachios with aromatic cardamom cream. 100% eggless, decorated with crushed pistachios and rose petals.",
      price: 1350.0,
      stock: 7,
      isFeatured: false,
      categorySlug: "eggless-cakes",
      images: [
        "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Kiran J.", rating: 5, comment: "Exquisite cardamom aroma and rich pistachio texture. Highly recommended!" }
      ]
    },
    {
      name: "Classic Vanilla Bean & Raspberry Cake",
      description: "Delicate vanilla bean sponge filled with fresh raspberry jam and velvety buttercream. Simple, timeless, and perfect for birthdays of all ages.",
      price: 850.0,
      stock: 10,
      isFeatured: false,
      categorySlug: "birthday-cakes",
      images: [
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop",
      ],
      reviews: [
        { authorName: "Liam P.", rating: 4, comment: "Kids loved it. Light and sweet." }
      ]
    }
  ];

  for (const prod of productsData) {
    const category = categories[prod.categorySlug];
    if (!category) continue;

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        isFeatured: prod.isFeatured,
        categoryId: category.id,
      },
    });

    // Create product images
    for (const imgUrl of prod.images) {
      await prisma.productImage.create({
        data: {
          url: imgUrl,
          productId: createdProduct.id,
        },
      });
    }

    // Create reviews
    for (const rev of prod.reviews) {
      await prisma.review.create({
        data: {
          rating: rev.rating,
          comment: rev.comment,
          authorName: rev.authorName,
          productId: createdProduct.id,
        },
      });
    }
  }

  console.log("Products and reviews created successfully.");
  console.log("Database seed completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
