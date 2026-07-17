const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src/data/ba-final-where-2026.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 1. Update NH Buenos Aires Latino
const nhLatino = data.availableProperties.find(p => p.name.includes("NH Buenos Aires Latino"));
if (nhLatino) {
  nhLatino.price = "$112";
  nhLatino.bookingUrl = "https://www.booking.com/hotel/ar/nh-latino.html";
}

// 2. Add new available properties
const newProperties = [
  {
    "name": "Bristol Hotel Buenos Aires",
    "address": "Cerrito 286, San Nicolás",
    "price": "$108",
    "rating": 4.2,
    "reviews": 2078,
    "status": "Available · 180m to Obelisk",
    "detail": "Stands directly beside Plaza de la República, offering standard and superior city-view rooms. Highly recommended to reserve a 'Superior Room with City View' on a high floor and request a guaranteed Obelisk-facing room.",
    "mapsQuery": "Bristol Hotel Cerrito 286 Buenos Aires",
    "bookingUrl": "https://www.booking.com/hotel/ar/bristol.html",
    "highlight": true,
    "location": { "lat": -34.6052041, "lng": -58.3823998 }
  },
  {
    "name": "Exe Hotel Colón",
    "address": "Carlos Pellegrini 507, San Nicolás",
    "price": "$101",
    "rating": 3.3,
    "reviews": 3919,
    "status": "Available · 180m to Obelisk",
    "detail": "Located right in the heart of Buenos Aires, offering tasteful suites overlooking the Obelisk and Avenida 9 de Julio. Be sure to book a 'Double Room, City View' or suite and ask for a guaranteed Obelisk view.",
    "mapsQuery": "Exe Hotel Colón Carlos Pellegrini 507 Buenos Aires",
    "bookingUrl": "https://www.booking.com/hotel/ar/exehotelcolon.html",
    "highlight": false,
    "location": { "lat": -34.6023514, "lng": -58.3808465 }
  },
  {
    "name": "El Misti Coliving Obelisco",
    "address": "Av. Corrientes 1122, San Nicolás",
    "price": "$105",
    "rating": 4.8,
    "reviews": 1751,
    "status": "Available · 260m to Obelisk",
    "detail": "A highly rated coliving and hotel option located right on Av. Corrientes. Features modern, spacious rooms with air conditioning and city views. Many rooms overlook Avenida 9 de Julio and the Obelisk. Highly recommended.",
    "mapsQuery": "El Misti Coliving Obelisco Av. Corrientes 1122 Buenos Aires",
    "bookingUrl": "https://www.booking.com/hotel/ar/el-misti-coliving-obelisco.html",
    "highlight": true,
    "location": { "lat": -34.6059763, "lng": -58.3822678 }
  },
  {
    "name": "Hotel NH Buenos Aires Tango",
    "address": "Cerrito 550, San Nicolás",
    "price": "$711",
    "rating": 4.4,
    "reviews": 1801,
    "status": "Available · 240m to Obelisk",
    "detail": "Offers an exceptional location right in front of the Obelisk. Many rooms feature prominent views of Avenida 9 de Julio and the Obelisk. Ask for a high-floor, front-facing room with a balcony to enjoy the views of the monument.",
    "mapsQuery": "NH Buenos Aires Tango Cerrito 550 Buenos Aires",
    "bookingUrl": "https://www.booking.com/hotel/ar/tango.html",
    "highlight": false,
    "location": { "lat": -34.601616, "lng": -58.382399 }
  }
];

newProperties.forEach(prop => {
  const exists = data.availableProperties.some(p => p.name.toLowerCase() === prop.name.toLowerCase());
  if (!exists) {
    data.availableProperties.push(prop);
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log("Successfully updated ba-final-where-2026.json");
