# Hostel Room Booking

React Native (Expo) app + Node/Express API + MongoDB Atlas.
Primary entity: **Room**. Related entity: **Booking** (references User and Room).

## 1. Backend
```
cd backend
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, ADMIN_CODE
npm install
npm run dev
```
Register in the app with the `ADMIN_CODE` in the "Staff code" field to become an admin.

## 2. Mobile
```
npx create-expo-app@latest mobile-app --template blank
cd mobile-app
# copy App.js and the src/ folder from ./mobile into this project (overwrite App.js)
npx expo install axios @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-secure-store expo-image-picker
# edit src/config.js -> API_URL = http://<your-computer-LAN-IP>:5000
npx expo start
```

## API
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | /api/auth/register, /login | public | bcrypt + JWT |
| GET | /api/auth/me | user | |
| GET | /api/rooms?roomType= | user | list |
| GET | /api/rooms/:id | user | |
| POST / PUT | /api/rooms(/:id) | admin | multipart, field `image` (jpeg/png/webp, 2 MB) |
| DELETE | /api/rooms/:id | admin | 409 if active bookings |
| POST | /api/bookings | user | 409 if room Full or duplicate active request |
| GET | /api/bookings/mine | user | history |
| GET | /api/bookings?status= | admin | all requests |
| GET / PUT / DELETE | /api/bookings/:id | owner/admin | PUT edits dates while Pending |
| PATCH | /api/bookings/:id/status | admin | `Approved` / `Rejected` |
| PATCH | /api/bookings/:id/cancel | owner/admin | releases the place if it was Approved |

## Business rules (backend/controllers/bookings.js)
- Approve: atomic capacity check + `currentOccupancy +1`; sets room `Full` at capacity
- Full room refuses new requests (409); capacity can't drop below occupancy
- Cancel/delete of an Approved booking: `currentOccupancy -1`, room back to `Available`
