ludo-multiplayer-arena/
│
├── server.js                 <-- Main App Entry Point (Integrates all backend systems)
├── ludoBoardMatrix.js        <-- Member 4: Core Ludo 15x15 Track Mapping Array
│
├── config/
│   └── db.js                 <-- Member 2: Mongoose MongoDB Initialization Protocol
│
├── models/
│   └── User.js               <-- Member 2: User Profiles & Guest Session Database Schemas
│
├── network/
│   └── socketHandler.js      <-- Member 3: Standalone Socket.io Server & Connection Pipeline
│
└── public/                   <-- Member 1: Static UI Engine Templates
    ├── index.html            (Welcome Portal Hub)
    ├── login.html            (Authentication Form & Password Reset Modal Hooks)
    └── signup.html           (New Player Registration Form Layout)
