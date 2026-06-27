const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");
const Show = require("../models/Show");
const movieStatusMap = require("./movieStatusMap");
const connectDB = require("../config/db");

// Load environment variables from the root of Backend
dotenv.config({ path: path.join(__dirname, "../../.env") });

const getShowDate = (dayName, timeStr) => {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const targetDayIndex = daysOfWeek.indexOf(dayName.toLowerCase());
  
  const today = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  let targetDate = new Date(today);
  targetDate.setHours(hours, minutes, 0, 0);

  if (dayName.toLowerCase() === "today") {
    return targetDate;
  }
  
  if (targetDayIndex !== -1) {
    const currentDayIndex = today.getDay();
    let distance = targetDayIndex - currentDayIndex;
    if (distance <= 0) distance += 7; // get next week's occurrence
    targetDate.setDate(today.getDate() + distance);
  }
  return targetDate;
};

const seedDB = async () => {
  // Connect to the database
  await connectDB();
  console.log("Seeding database...");

  try {
    const moviesFilePath = path.join(
      __dirname,
      "../../../Frontend/src/data/Movies.js"
    );
    
    if (!fs.existsSync(moviesFilePath)) {
      throw new Error(`Movies.js not found at ${moviesFilePath}`);
    }

    const moviesContent = fs.readFileSync(moviesFilePath, "utf8");

    // 1. Build a map of variable names to asset filenames from import statements
    const importRegex = /import\s+(\w+)\s+from\s+["']\.\.\/assets\/([\w.-]+)["']/g;
    const imageMap = {};
    let match;
    while ((match = importRegex.exec(moviesContent)) !== null) {
      imageMap[match[1]] = match[2];
    }

    // 2. Clean the code for evaluation
    let cleanContent = moviesContent.replace(/import\s+.+;?/g, ""); // Strip all imports

    // Replace the image variables (like image: movie1) with string equivalents (like image: "movie1.jpg")
    Object.keys(imageMap).forEach((varName) => {
      const replacement = `"${imageMap[varName]}"`;
      const regex = new RegExp(`:\\s*${varName}\\b`, "g");
      cleanContent = cleanContent.replace(regex, `: ${replacement}`);
    });

    // Replace ES Module export with CommonJS export
    cleanContent = cleanContent.replace(
      /export\s+default\s+(\w+);?/,
      "module.exports = $1;"
    );

    // Evaluate the javascript code
    const scriptContext = { module: { exports: [] } };
    vm.createContext(scriptContext);
    vm.runInContext(cleanContent, scriptContext);

    const rawMovies = scriptContext.module.exports;

    if (!Array.isArray(rawMovies) || rawMovies.length === 0) {
      throw new Error("Failed to extract movie data from Movies.js");
    }

    const upcomingMoviesStaticData = [
      {
        id: 13,
        title: "Mohabbatein",
        duration: "1 hour 28 minutes",
        rating: "Rated R",
        summary: "A familiar-looking group of teenagers find themselves being stalked by a more-than-vaguely familiar masked killer. The comedic parody takes on horror classics with slapstick humor and relentless pop-culture references.",
        cast: ["Anna Faris", "Regina Hall", "Marlon Wayans", "Keenen Ivory Wayans"],
        genre: ["Comedy", "Horror"],
        trailer: "https://www.youtube.com/watch?v=OjlZFIY7VHU",
        image: "movie13.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 14,
        title: "Hereditary",
        duration: "1 hour 23 minutes",
        rating: "Rated R",
        summary: "Four teens are tricked by their professor into visiting a haunted house for a school project, only to realize the house possesses a mischievous and terrifying spirit of its own.",
        cast: ["Anna Faris", "Regina Hall", "Shawn Wayans", "Keenen Ivory Wayans"],
        genre: ["Comedy", "Horror"],
        trailer: "https://www.youtube.com/watch?v=V6wWKNij_1M",
        image: "movie14.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 15,
        title: "Partner",
        duration: "1 hour 24 minutes",
        rating: "Rated PG-13",
        summary: "Cindy must investigate mysterious crop circles and a lethal videotape to save the world, crossing paths with bizarre aliens, psychic mediums, and ridiculous spoof situations along the way.",
        cast: ["Anna Faris", "Regina Hall", "Charlie Sheen", "David Zucker"],
        genre: ["Comedy", "Horror", "Sci-Fi"],
        trailer: "https://www.youtube.com/watch?v=75Ko96Uqh14",
        image: "movie15.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 16,
        title: "Mujhse Shaadi Karogi",
        duration: "1 hour 23 minutes",
        rating: "Rated PG-13",
        summary: "Cindy finds a house haunted by a creepy little boy and goes on a wild quest to stop an alien 'tri-pod' invasion, spoofing blockbusters of the mid-2000s in this hilarious horror-comedy mashup.",
        cast: ["Anna Faris", "Regina Hall", "Craig Bierko", "David Zucker"],
        genre: ["Comedy", "Horror"],
        trailer: "https://www.youtube.com/watch?v=t5oUBesHGA8",
        image: "movie16.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 17,
        title: "Tere Ishk Mein",
        duration: "1 hour 26 minutes",
        rating: "Rated PG-13",
        summary: "A happy couple starts to experience unusual and supernatural activity after bringing their newborn baby home from the hospital, prompting them to seek the help of paranormal experts.",
        cast: ["Ashley Tisdale", "Simon Rex", "Erica Ash", "Malcolm D. Lee"],
        genre: ["Comedy", "Horror"],
        trailer: "https://www.youtube.com/watch?v=9AJsFRNJGZ8",
        image: "movie17.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 18,
        title: "Avengers: Endgame",
        duration: "2 hours 5 minutes",
        rating: "Rated PG-13",
        summary: "The heroic warrior He-Man battles the evil Skeletor for control of Castle Grayskull and the universe. Together with his trusted allies, he must harness cosmic power to protect Eternia.",
        cast: ["Nicholas Galitzine", "Camila Mendes", "Travis Knight", "David S. Goyer"],
        genre: ["Action", "Adventure", "Fantasy"],
        trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
        image: "movie18.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"],
          sunday: ["12:35", "15:00", "17:45", "20:30"],
          monday: ["12:35", "15:00", "17:45", "20:30"],
          tuesday: ["12:35", "15:00", "17:45", "20:30"],
          wednesday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 19,
        title: "Toy Story 5",
        duration: "1 hour 45 minutes",
        rating: "Rated PG-13",
        summary: "An inspiring biography exploring the early days of the Christopher movement, highlighting the foundational values of grassroots leadership and peaceful activism.",
        cast: ["Christopher Nolan", "Christian Bale", "Cillian Murphy"],
        genre: ["Drama", "Biography"],
        trailer: "https://www.youtube.com/watch?v=c51ND9Hdbw0",
        image: "movie19.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45"]
        }
      },
      {
        id: 20,
        title: "The Conjuring",
        duration: "1 hour 50 minutes",
        rating: "Rated PG-13",
        summary: "The second chapter of the movement's history, tracking its mid-century growth and the adoption of modern media methods to reach a broader, global audience.",
        cast: ["Christopher Nolan", "Christian Bale", "Cillian Murphy"],
        genre: ["Drama", "Biography"],
        trailer: "https://www.youtube.com/watch?v=ejMMn0t58Lc",
        image: "movie20.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 21,
        title: "Annabelle",
        duration: "1 hour 55 minutes",
        rating: "Rated PG-13",
        summary: "A powerful continuation detailing the struggle for civil rights inclusion and the expansion of community-driven educational programs around the country.",
        cast: ["Christopher Nolan", "Christian Bale", "Cillian Murphy"],
        genre: ["Drama", "Biography"],
        trailer: "https://www.youtube.com/watch?v=paFgQNPGlsg",
        image: "movie21.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 22,
        title: "Donnie Darko",
        duration: "2 hours 0 minutes",
        rating: "Rated PG-13",
        summary: "As the movement enters a new era, this film explores the adaptation of their message to the internet and early digital platforms, overcoming generational divides.",
        cast: ["Christopher Nolan", "Christian Bale", "Cillian Murphy"],
        genre: ["Drama", "Biography"],
        trailer: "https://www.youtube.com/watch?v=bzLn8sYeM9o",
        image: "movie22.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 23,
        title: "Project Hail Mary",
        duration: "2 hours 10 minutes",
        rating: "Rated PG-13",
        summary: "The final installment wraps up the epic history, celebrating decades of community efforts and presenting a vision for the future of positive grassroots engagement.",
        cast: ["Christopher Nolan", "Christian Bale", "Cillian Murphy"],
        genre: ["Drama", "Biography"],
        trailer: "https://www.youtube.com/watch?v=m08TxIsFTRI",
        image: "movie23.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 24,
        title: "La La Land",
        duration: "1 hour 26 minutes",
        rating: "Rated R",
        summary: "A frustrated suburban housewife's life falls apart when her husband's infidelity, her son's foot-fetish crimes, and her daughter's pregnancy come to light.",
        cast: ["Divine", "Tab Hunter", "John Waters"],
        genre: ["Comedy", "Drama"],
        trailer: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
        image: "movie24.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 25,
        title: "Breaking Bad",
        duration: "1 hour 30 minutes",
        rating: "Rated R",
        summary: "A deluxe version of the suburban satire featuring exclusive commentary and restored footage showing John Waters' visionary comedy in all its glorious polyester.",
        cast: ["Divine", "Tab Hunter", "John Waters"],
        genre: ["Comedy", "Drama"],
        trailer: "https://www.youtube.com/watch?v=HhesaQXLuRY",
        image: "movie25.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      },
      {
        id: 26,
        title: "Money Heist",
        duration: "1 hour 15 minutes",
        rating: "Rated PG-13",
        summary: "An inside look at the creation of John Waters' legendary masterpiece, complete with interviews detailing the development of the famous 'Odorama' scratch-and-sniff card gimmick.",
        cast: ["John Waters", "Divine"],
        genre: ["Documentary"],
        trailer: "https://www.youtube.com/watch?v=_InqQJRqGW4",
        image: "movie26.jpg",
        timings: {
          today: ["20:30"],
          saturday: ["12:35", "15:00", "17:45", "20:30"]
        }
      }
    ];

    const combinedSeededMovies = [...rawMovies, ...upcomingMoviesStaticData];

    // 3. Populate MongoDB
    for (const rawMovie of combinedSeededMovies) {
      const status = movieStatusMap[rawMovie.id] || "now-showing";

      // Map raw movie data to Movie schema fields
      const movieData = {
        id: rawMovie.id,
        title: rawMovie.title,
        description: rawMovie.summary || rawMovie.description || "",
        genre: rawMovie.genre || [],
        language: rawMovie.language || "English",
        duration: rawMovie.duration || "",
        rating: rawMovie.rating || "",
        imdb: rawMovie.imdb || "",
        releaseDate: rawMovie.releaseDate || new Date(),
        poster: rawMovie.image || "",
        banner: rawMovie.image ? rawMovie.image.replace("movie", "banner").replace(".jpg", ".png") : "",
        trailerUrl: rawMovie.trailer || "",
        status: status,
        cast: rawMovie.cast || [],
        isSeeded: true,
      };

      // Upsert movie to prevent duplicate inserts
      const movieDoc = await Movie.findOneAndUpdate(
        { id: rawMovie.id },
        movieData,
        { new: true, upsert: true }
      );

      console.log(`Seeded Movie: "${movieDoc.title}" (Status: ${status})`);

      // 4. Generate default shows for this movie based on timings (seed only)
      // NOTE: The Show model derives showTime/showDate as virtuals from showDateTime.
      //       Do NOT store them as explicit fields here.
      if (rawMovie.timings) {
        for (const [day, times] of Object.entries(rawMovie.timings)) {
          for (const time of times) {
            const showDateTime = getShowDate(day, time);
            const showData = {
              movie: movieDoc._id,
              showDateTime: showDateTime,
              ticketPrice: 15.0,
              screenName: "Screen 1",
              totalSeats: 44,
              status: "Active",
            };

            // Upsert show to prevent duplicates
            await Show.findOneAndUpdate(
              { showDateTime: showDateTime, screenName: "Screen 1" },
              showData,
              { upsert: true, new: true }
            );
          }
        }
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
