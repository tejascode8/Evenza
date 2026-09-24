const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Event = require("./models/Event");
const Booking = require("./models/Booking");

dotenv.config();

// ==========================================
// 25 REALISTIC DIVERSE ATTENDEES & ADMIN
// ==========================================
const users = [
  {
    name: "Evenza Admin",
    email: "admin@evenza.com",
    password: "Admin@12345",
    role: "admin",
  },
  {
    name: "Demo User",
    email: "demo@evenza.com",
    password: "@demo$123",
    role: "user",
  },
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    password: "@aarav$123",
    role: "user",
  },
  {
    name: "Sophia Chen",
    email: "sophia.chen@example.com",
    password: "@sophia$123",
    role: "user",
  },
  {
    name: "Marcus Vance",
    email: "marcus.v@example.com",
    password: "@marcus$123",
    role: "user",
  },
  {
    name: "Elena Rostova",
    email: "elena.r@example.com",
    password: "@elena$123",
    role: "user",
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    password: "@david$123",
    role: "user",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    password: "@priya$123",
    role: "user",
  },
  {
    name: "Liam O'Connor",
    email: "liam.oc@example.com",
    password: "@liam$123",
    role: "user",
  },
  {
    name: "Zoe Kravitz",
    email: "zoe.k@example.com",
    password: "@zoe$123",
    role: "user",
  },
  {
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    password: "@rohan$123",
    role: "user",
  },
  {
    name: "Chloe Dubois",
    email: "chloe.d@example.com",
    password: "@chloe$123",
    role: "user",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    password: "@vikram$123",
    role: "user",
  },
  {
    name: "Isabella Martinez",
    email: "isabella.m@example.com",
    password: "@isabella$123",
    role: "user",
  },
  {
    name: "Alexandre Moreau",
    email: "alex.m@example.com",
    password: "@alex$123",
    role: "user",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    password: "@ananya$123",
    role: "user",
  },
  {
    name: "Julian Alvarez",
    email: "julian.a@example.com",
    password: "@julian$123",
    role: "user",
  },
  {
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    password: "@sarah$123",
    role: "user",
  },
  {
    name: "Tariq Al-Mansoor",
    email: "tariq.m@example.com",
    password: "@tariq$123",
    role: "user",
  },
  {
    name: "Maya Lin",
    email: "maya.lin@example.com",
    password: "@maya$123",
    role: "user",
  },
  {
    name: "Ethan Hunt",
    email: "ethan.hunt@example.com",
    password: "@ethan$123",
    role: "user",
  },
  {
    name: "Kavita Nair",
    email: "kavita.n@example.com",
    password: "@kavita$123",
    role: "user",
  },
  {
    name: "Lucas Silva",
    email: "lucas.s@example.com",
    password: "@lucas$123",
    role: "user",
  },
  {
    name: "Emily Watson",
    email: "emily.w@example.com",
    password: "@emily$123",
    role: "user",
  },
  {
    name: "Hiroshi Tanaka",
    email: "hiroshi.t@example.com",
    password: "@hiroshi$123",
    role: "user",
  },
];

// ==========================================
// 21 REALISTIC EXPERIENCES WITH OCCUPANCY TARGETS
// ==========================================
const events = [
  // --- 6 FREE EXPERIENCES (ticketPrice: 0) ---
  {
    title: "Open Source AI & LLM Developer Hackathon",
    description:
      "A 48-hour collaborative buildathon uniting AI researchers, open-source contributors, and software engineers to create open weights applications and intelligent autonomous agents.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: "Innovation Hub & Online, San Francisco",
    category: "Technology",
    totalSeats: 350,
    occupancyRate: 0.85, // 85% full (High demand)
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Global Indie Creators & Contemporary Art Showcase",
    description:
      "Free public access exhibition featuring over 60 independent visual artists, digital sculptors, and mixed-media installations with interactive live painting sessions.",
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    location: "Metropolitan Design Gallery, New York",
    category: "Art",
    totalSeats: 250,
    occupancyRate: 1.0, // 100% SOLD OUT
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Founders & Angel Investors Networking Mixer",
    description:
      "An open evening connecting early-stage tech founders, venture scouts, and angel investors. Pitch ideas, share product feedback, and foster co-founder connections over sunset mocktails.",
    date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    location: "Skyline Lounge & Rooftop, London",
    category: "Business",
    totalSeats: 180,
    occupancyRate: 0.75, // 75% full
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Community Acoustic Jam & Songwriters Circle",
    description:
      "An open community acoustic music jam session in the park. Bring your instruments, collaborate with fellow singer-songwriters, or enjoy relaxing live melodies under the open sky.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: "Zilker Park Hillside Amphitheater, Austin",
    category: "Music",
    totalSeats: 300,
    occupancyRate: 0.40, // 40% full (Moderate)
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Web3 & Decentralized Protocols Open Workshop",
    description:
      "Free interactive workshop on building decentralized peer-to-peer protocols, cryptography fundamentals, smart contract security, and open ledger interoperability.",
    date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
    location: "Tech Campus Arena, Berlin",
    category: "Technology",
    totalSeats: 220,
    occupancyRate: 0.0, // 0% booked (Brand New Launch)
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Urban Street Art & Live Mural Festival",
    description:
      "Witness acclaimed graffiti artists, muralists, and street culture illustrators transform giant urban canvases live accompanied by underground DJ sets and food trucks.",
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    location: "Wynwood Arts District, Miami",
    category: "Art",
    totalSeats: 400,
    occupancyRate: 0.90, // 90% full (Almost Sold Out)
    ticketPrice: 0,
    image:
      "https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&q=80&w=800",
  },

  // --- 15 PAID EXPERIENCES (ticketPrice > 0) ---
  {
    title: "Neon Nights EDM & Visuals Festival",
    description:
      "Electrifying live electronic dance music featuring top international headline DJs, immersive laser light displays, spatial audio engineering, and dynamic stage pyrotechnics.",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    location: "Grand Arena & Amphitheater, Las Vegas",
    category: "Music",
    totalSeats: 600,
    occupancyRate: 1.0, // 100% SOLD OUT
    ticketPrice: 2499,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Global Leaders & Venture Capital Summit 2026",
    description:
      "The premier global conference for executive leadership, venture capitalists, and multinational decision-makers discussing geopolitical market shifts and enterprise AI transformation.",
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    location: "The Ritz-Carlton Grand Ballroom, Singapore",
    category: "Business",
    totalSeats: 200,
    occupancyRate: 0.88, // 88% full (High demand)
    ticketPrice: 5500,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "React, Next.js & Cloud Native Architecture Retreat",
    description:
      "Comprehensive deep dive into modern full-stack web development, microfrontends, high-throughput backend services, and serverless edge deployment patterns.",
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: "Silicon Valley Tech Pavilion, San Jose",
    category: "Technology",
    totalSeats: 300,
    occupancyRate: 0.70, // 70% full
    ticketPrice: 1200,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Acoustic Sunset & Jazz Live Experience",
    description:
      "An intimate open-air twilight concert showcasing soulful live jazz quartets, acoustic folk sensations, and master instrumentalists by the bay.",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    location: "Waterfront Amphitheater, Sydney",
    category: "Music",
    totalSeats: 220,
    occupancyRate: 0.55, // 55% full (Moderate)
    ticketPrice: 850,
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Next-Gen Cyber Defense & Zero-Trust Summit",
    description:
      "Hands-on masterclasses in automated threat detection, zero-trust network infrastructure, cryptographic protocols, and offensive security red-teaming techniques.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: "Convention Center & Tech Center, Zurich",
    category: "Technology",
    totalSeats: 150,
    occupancyRate: 1.0, // 100% SOLD OUT
    ticketPrice: 1800,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "International Modern Sculpture & Digital Canvas Biennial",
    description:
      "Curated international exhibition celebrating cutting-edge algorithmic visuals, kinetic sculptures, generative media installations, and avant-garde fine art.",
    date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    location: "Palais des Arts Contemporains, Paris",
    category: "Art",
    totalSeats: 400,
    occupancyRate: 0.30, // 30% full (Early stage)
    ticketPrice: 450,
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Fintech Frontier & Decentralized Markets Forum",
    description:
      "Explore the evolution of global payment rails, automated clearing systems, cross-border digital assets, and institutional-grade financial intelligence platforms.",
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    location: "Financial District Convention Hall, Dubai",
    category: "Business",
    totalSeats: 280,
    occupancyRate: 0.72, // 72% full
    ticketPrice: 3200,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Symphonic Orchestra & Cinematic Soundscapes",
    description:
      "An awe-inspiring 80-piece philharmonic orchestra performing iconic cinematic masterworks, Hans Zimmer arrangements, and emotional grand symphonies.",
    date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    location: "Royal Albert Symphony Hall, London",
    category: "Music",
    totalSeats: 450,
    occupancyRate: 1.0, // 100% SOLD OUT
    ticketPrice: 1950,
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Full-Stack AI Engineering & Agentic Workflow Bootcamp",
    description:
      "Intensive 2-day hands-on masterclass building production LLM pipelines, autonomous multi-agent systems, embeddings retrieval systems, and vector databases.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    location: "Tech Innovation Hub, Austin",
    category: "Technology",
    totalSeats: 180,
    occupancyRate: 0.80, // 80% full
    ticketPrice: 2200,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Global Product Design & UX Leadership Conference",
    description:
      "Gathering world-renowned design directors, user researchers, and product architects to dissect design systems, micro-interactions, and spatial UI interfaces.",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    location: "Design Museum Auditorium, Amsterdam",
    category: "Art",
    totalSeats: 250,
    occupancyRate: 0.60, // 60% full
    ticketPrice: 1400,
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Startup Scale-Up & Enterprise Sales Masterclass",
    description:
      "Proven enterprise go-to-market strategies, B2B sales acceleration tactics, and fundraising blueprints delivered by experienced unicorn founders.",
    date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    location: "Financial Executive Centre, Toronto",
    category: "Business",
    totalSeats: 160,
    occupancyRate: 0.0, // 0% booked (New Opening)
    ticketPrice: 2800,
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Electric Underground Rock & Alternative Nights",
    description:
      "High-octane live indie rock, post-punk, and alternative band showcase featuring electrifying guitar riffs, raw energy, and stellar stage lighting.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: "The Roxy Underground Stage, Los Angeles",
    category: "Music",
    totalSeats: 350,
    occupancyRate: 0.78, // 78% full
    ticketPrice: 950,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Quantum Computing & Advanced Algorithmic Systems",
    description:
      "Advanced research symposium on quantum circuit synthesis, qubits error correction, quantum annealing, and high-performance numerical simulation.",
    date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    location: "National Science Complex, Boston",
    category: "Technology",
    totalSeats: 120,
    occupancyRate: 1.0, // 100% SOLD OUT
    ticketPrice: 3500,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Avant-Garde Photography & Visual Storytelling Expo",
    description:
      "Celebrated photojournalists and editorial fine-art photographers showcase visual documentary masterpieces with live artist critique panels.",
    date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    location: "Fotografiska Grand Gallery, Stockholm",
    category: "Art",
    totalSeats: 280,
    occupancyRate: 0.45, // 45% full
    ticketPrice: 650,
    image:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "E-Commerce Growth & Global Supply Chain Summit",
    description:
      "Strategic summit breaking down automated omnichannel logistics, AI dynamic pricing models, conversion optimization, and cross-border customs fulfillment.",
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    location: "International Trade Expo Centre, Tokyo",
    category: "Business",
    totalSeats: 230,
    occupancyRate: 0.0, // 0% booked (Early Bird)
    ticketPrice: 2100,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/evenza",
    );
    console.log("\n✅ MongoDB connection open...");

    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log("🗑️  Cleared existing data.");

    // Hash user passwords
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = users.map((u) => ({
      ...u,
      password: bcrypt.hashSync(u.password, salt),
      isVerified: true,
    }));

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find((u) => u.role === "admin");
    const demoUser = createdUsers.find((u) => u.email === "demo@evenza.com");
    const normalUsers = createdUsers.filter((u) => u.role === "user");
    console.log(`👤 Created ${createdUsers.length} total realistic attendee accounts.`);

    // Prepare events with realistic remaining seats based on occupancy rate
    const eventsWithSeats = events.map((e) => {
      let bookedSeats = Math.round(e.totalSeats * e.occupancyRate);
      let availableSeats = e.totalSeats - bookedSeats;
      if (e.occupancyRate >= 1.0) {
        availableSeats = 0; // Completely Sold Out
      }
      return {
        title: e.title,
        description: e.description,
        date: e.date,
        location: e.location,
        category: e.category,
        totalSeats: e.totalSeats,
        availableSeats: availableSeats,
        ticketPrice: e.ticketPrice,
        image: e.image,
        createdBy: adminUser._id,
      };
    });

    const createdEvents = await Event.insertMany(eventsWithSeats);
    console.log(
      `🎉 Created ${createdEvents.length} distinct events with realistic occupancy distribution (Sold Out, 70-90% full, Moderate, 0% launch).`,
    );

    // Generate Bookings Data
    const bookingsData = [];

    // Ensure Demo User has realistic diverse bookings for immediate testing
    if (demoUser) {
      const soldOutEvent = createdEvents.find(e => e.availableSeats === 0);
      const highDemandEvent = createdEvents.find(e => e.availableSeats > 0 && e.availableSeats < 100);
      const freeEvent = createdEvents.find(e => e.ticketPrice === 0 && e.availableSeats > 0);
      const newEvent = createdEvents.find(e => e.availableSeats === e.totalSeats);

      if (soldOutEvent) {
        bookingsData.push({
          userId: demoUser._id,
          eventId: soldOutEvent._id,
          status: "confirmed",
          paymentStatus: "paid",
          amount: soldOutEvent.ticketPrice,
          bookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        });
      }
      if (highDemandEvent) {
        bookingsData.push({
          userId: demoUser._id,
          eventId: highDemandEvent._id,
          status: "confirmed",
          paymentStatus: "paid",
          amount: highDemandEvent.ticketPrice,
          bookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        });
      }
      if (freeEvent) {
        bookingsData.push({
          userId: demoUser._id,
          eventId: freeEvent._id,
          status: "pending",
          paymentStatus: "paid",
          amount: 0,
          bookedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        });
      }
      if (newEvent) {
        bookingsData.push({
          userId: demoUser._id,
          eventId: newEvent._id,
          status: "cancelled",
          paymentStatus: "not_paid",
          amount: newEvent.ticketPrice,
          bookedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Populate realistic attendee bookings for each event
    for (const event of createdEvents) {
      if (event.availableSeats === event.totalSeats) {
        // 0% booked - skip or at most 1 cancelled/pending
        continue;
      }

      // Pick a pool of users to assign bookings
      const attendeeCount = event.availableSeats === 0 
        ? Math.min(normalUsers.length, Math.floor(Math.random() * 4) + 6) // 6-9 bookings for sold out
        : Math.floor(Math.random() * 4) + 3; // 3-6 bookings

      const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, attendeeCount);

      for (const user of selectedUsers) {
        // Avoid duplicate booking for same user and event
        const alreadyBooked = bookingsData.some(b => b.userId.toString() === user._id.toString() && b.eventId.toString() === event._id.toString());
        if (alreadyBooked) continue;

        let status = "confirmed";
        if (event.availableSeats > 0 && Math.random() < 0.25) {
          status = Math.random() > 0.5 ? "pending" : "cancelled";
        }

        let paymentStatus = "paid";
        if (event.ticketPrice > 0 && status === "pending") {
          paymentStatus = Math.random() > 0.5 ? "paid" : "not_paid";
        } else if (status === "cancelled") {
          paymentStatus = "not_paid";
        }

        // Stagger booking dates over the past 7 days
        const daysAgo = Math.floor(Math.random() * 6);
        const hoursAgo = Math.floor(Math.random() * 24);
        const bookingDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000 + hoursAgo * 60 * 60 * 1000));

        bookingsData.push({
          userId: user._id,
          eventId: event._id,
          status: status,
          paymentStatus: paymentStatus,
          amount: event.ticketPrice,
          bookedAt: bookingDate,
        });
      }
    }

    await Booking.insertMany(bookingsData);
    console.log(
      `🎫 Inserted ${bookingsData.length} realistic attendee bookings across all events (Confirmed, Pending, Cancelled, Paid, Unpaid).`,
    );

    console.log("\n🚀 Database seeded successfully with real-life production data!");
    console.log("----------------------------------------------------------------");
    console.log("Admin Account: admin@evenza.com / Admin@12345");
    console.log("Demo User:     demo@evenza.com  / @demo$123");
    console.log("All Users Password Pattern: @<First_Name_Lowercase>$123");
    console.log("----------------------------------------------------------------\n");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();
