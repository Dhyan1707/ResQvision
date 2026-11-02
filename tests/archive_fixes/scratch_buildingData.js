// ==========================================
// BUILDING DATA MODEL
// AI FIRE EVACUATION SYSTEM
// ==========================================
//
// COLLEGE-SPECIFIC BUILDING DATA
// Shri Bhagubhai Mafatlal Polytechnic
//
// All coordinates are currently UNVERIFIED
// and based on a proportional trace of the
// official Ground Floor blueprint.
// ==========================================

const buildingData = {
  collegeName: "Shri Bhagubhai Mafatlal Polytechnic",
  interFloorConnections: [],
  m3InterFloorConnections: [
  {
    from: 'G_STAIRS_NODE_N',
    to: 'F1_STAIRS_MAIN_NODE',
    type: 'vertical'
  },
  {
    from: 'F1_STAIRS_MAIN_NODE',
    to: 'G_STAIRS_NODE_N',
    type: 'vertical'
  },
          {
                    "from": "F3_STAIRS_MAIN_NODE",
                    "to": "F4_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_MAIN_NODE",
                    "to": "F3_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F3_STAIRS_WEST_NODE",
                    "to": "F4_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_WEST_NODE",
                    "to": "F3_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F3_STAIRS_EAST_NODE",
                    "to": "F4_STAIRS_EAST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_EAST_NODE",
                    "to": "F3_STAIRS_EAST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_MAIN_NODE",
                    "to": "F5_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F5_STAIRS_MAIN_NODE",
                    "to": "F4_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_WEST_NODE",
                    "to": "F5_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F5_STAIRS_WEST_NODE",
                    "to": "F4_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F4_STAIRS_EAST_NODE",
                    "to": "F5_STAIRS_EAST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F5_STAIRS_EAST_NODE",
                    "to": "F4_STAIRS_EAST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F5_STAIRS_MAIN_NODE",
                    "to": "F6_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F6_STAIRS_MAIN_NODE",
                    "to": "F5_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F5_STAIRS_WEST_NODE",
                    "to": "F6_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F5_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F6_STAIRS_MAIN_NODE",
                    "to": "F7_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F7_STAIRS_MAIN_NODE",
                    "to": "F6_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F7_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F6_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F1_STAIRS_WEST_NODE",
                    "to": "F3_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F3_STAIRS_WEST_NODE",
                    "to": "F1_STAIRS_WEST_NODE",
                    "type": "vertical"
          },
          
          
          {
                    "from": "F1_STAIRS_MAIN_NODE",
                    "to": "F2_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F2_STAIRS_MAIN_NODE",
                    "to": "F1_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F2_STAIRS_MAIN_NODE",
                    "to": "F3_STAIRS_MAIN_NODE",
                    "type": "vertical"
          },
          {
                    "from": "F3_STAIRS_MAIN_NODE",
                    "to": "F2_STAIRS_MAIN_NODE",
                    "type": "vertical"
          }
],
  floors: [
    {
      level: 0,
      name: "Ground Floor",
      metadata: {
        source: "Official Ground Floor Blueprint",
        verified: false,
        note: "Detailed architectural trace"
      },
      units: "meters",
      elevation: 0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
          // ==========================================
          // OUTER BOUNDARY (Continuous Shell)
          // ==========================================
          { id: "G_WALL_EXT_N", type: "exterior", x1: -80, z1: -35, x2: 80, z2: -35, thickness: 0.5 },
          { id: "G_WALL_EXT_S", type: "exterior", x1: -80, z1: 35, x2: 80, z2: 35, thickness: 0.5 },
          { id: "G_WALL_EXT_W", type: "exterior", x1: -80, z1: -35, x2: -80, z2: 35, thickness: 0.5 },
          { id: "G_WALL_EXT_E", type: "exterior", x1: 80, z1: -35, x2: 80, z2: 35, thickness: 0.5 },
          
          // ==========================================
          // 5. CENTRAL PASSAGEWAY (Width 10m: z=-5 to z=5)
          // ==========================================
          // North Corridor Wall (Z = -5)
          { id: "G_CORR_N_ENTRANCE", type: "partition", x1: -80, z1: -5, x2: -50, z2: -5, thickness: 0.5 },
          { id: "G_CORR_N_BLANK", type: "partition", x1: -50, z1: -5, x2: -28, z2: -5, thickness: 0.5 },
          // 2. TOILET / CENTRAL CORE
          { id: "G_CORR_N_TOILET_LOBBY", type: "partition", x1: -28, z1: -5, x2: -22, z2: -5, thickness: 0.5 }, // Lobby entrance
          { id: "G_CORR_N_BOYS", type: "partition", x1: -22, z1: -5, x2: -15, z2: -5, thickness: 0.5 },
          { id: "G_CORR_N_WC_RECESS_W", type: "partition", x1: -15, z1: -5, x2: -15, z2: -8, thickness: 0.5 },
          { id: "G_CORR_N_WC_RECESS_N", type: "partition", x1: -15, z1: -8, x2: -10, z2: -8, thickness: 0.5 },
          { id: "G_CORR_N_WC_RECESS_E", type: "partition", x1: -10, z1: -8, x2: -10, z2: -5, thickness: 0.5 },
          { id: "G_CORR_N_GIRLS", type: "partition", x1: -10, z1: -5, x2: -4, z2: -5, thickness: 0.5 },
          { id: "G_CORR_N_HANDICAP", type: "partition", x1: -4, z1: -5, x2: 0, z2: -5, thickness: 0.5 },
          
          // 4. MAIN STAIR AREA (North Core)
          { id: "G_CORR_N_STAIRS", type: "partition", x1: 0, z1: -5, x2: 12, z2: -5, thickness: 0.5 },
          
          // 3. WORKSHOP
          { id: "G_CORR_N_WORKSHOP", type: "partition", x1: 12, z1: -5, x2: 45, z2: -5, thickness: 0.5 },
          { id: "G_CORR_N_RAW", type: "partition", x1: 45, z1: -5, x2: 55, z2: -5, thickness: 0.5 },
          
          // 8. LATHE MACHINE SHOP
          { id: "G_CORR_N_LATHE", type: "partition", x1: 55, z1: -5, x2: 80, z2: -5, thickness: 0.5 },

          // South Corridor Wall (Z = 5)
          // 1. ADMINISTRATION BLOCK
          { id: "G_CORR_S_ADMIN_RECEP", type: "partition", x1: -80, z1: 5, x2: -60, z2: 5, thickness: 0.5 },
          { id: "G_CORR_S_ADMIN_OFFICE", type: "partition", x1: -60, z1: 5, x2: -30, z2: 5, thickness: 0.5 },
          
          // 4. LIFT LOBBY (South Core)
          { id: "G_CORR_S_LIFT_LOBBY_W", type: "partition", x1: -30, z1: 5, x2: -30, z2: 15, thickness: 0.5 },
          { id: "G_CORR_S_LIFT_LOBBY_S", type: "partition", x1: -30, z1: 15, x2: -15, z2: 15, thickness: 0.5 },
          { id: "G_CORR_S_LIFT_LOBBY_E", type: "partition", x1: -15, z1: 15, x2: -15, z2: 5, thickness: 0.5 },
          { id: "G_CORR_S_LIFT_CORE", type: "partition", x1: -15, z1: 5, x2: 0, z2: 5, thickness: 0.5 },
          
          { id: "G_CORR_S_STAIRS", type: "partition", x1: 0, z1: 5, x2: 12, z2: 5, thickness: 0.5 },
          
          // 6. FLUID MACHINERY LAB
          { id: "G_CORR_S_FLUID", type: "partition", x1: 12, z1: 5, x2: 35, z2: 5, thickness: 0.5 },
          
          // 7. S.O.M & MATERIAL TESTING LAB
          { id: "G_CORR_S_SOM", type: "partition", x1: 35, z1: 5, x2: 80, z2: 5, thickness: 0.5 },

          // ==========================================
          // 9. ENTRANCE LOBBY VESTIBULE (-80 to -50)
          // ==========================================
          { id: "G_PART_N_ENTRANCE_E", type: "partition", x1: -50, z1: -35, x2: -50, z2: -5, thickness: 0.5 },

          // ==========================================
          // TOILET CORE PARTITIONS
          // ==========================================
          { id: "G_PART_TOILET_W", type: "partition", x1: -28, z1: -35, x2: -28, z2: -5, thickness: 0.5 },
          { id: "G_PART_TOILET_BOYS_E", type: "partition", x1: -15, z1: -35, x2: -15, z2: -8, thickness: 0.5 },
          { id: "G_PART_TOILET_GIRLS_E", type: "partition", x1: -4, z1: -35, x2: -4, z2: -5, thickness: 0.5 },
          { id: "G_PART_HANDICAP_E", type: "partition", x1: 0, z1: -35, x2: 0, z2: -5, thickness: 0.5 },
          // Internal stalls / lobby
          { id: "G_PART_TOILET_LOBBY", type: "partition", x1: -28, z1: -15, x2: -15, z2: -15, thickness: 0.3 },

          // ==========================================
          // NORTH CORE (Stairs & Workshop boundaries)
          // ==========================================
          { id: "G_PART_STAIRS_N_E", type: "partition", x1: 12, z1: -35, x2: 12, z2: -5, thickness: 0.5 },
          // Stairwell enclosure
          { id: "G_PART_STAIRS_N_ENC", type: "partition", x1: 0, z1: -18, x2: 12, z2: -18, thickness: 0.5 },
          
          { id: "G_PART_RAW_E", type: "partition", x1: 55, z1: -35, x2: 55, z2: -5, thickness: 0.5 },
          { id: "G_PART_LATHE_HORIZ", type: "partition", x1: 55, z1: -20, x2: 80, z2: -20, thickness: 0.5 },          
          // Workshop internal boundaries


          // ==========================================
          // 1. ADMINISTRATION BLOCK PARTITIONS
          // ==========================================
          { id: "G_PART_ADMIN_E", type: "partition", x1: -30, z1: 5, x2: -30, z2: 35, thickness: 0.5 },
          // Internal corridors and main admin divisions


          // ==========================================
          // 4. LIFT LOBBY & SOUTH STAIRS
          // ==========================================
          { id: "G_PART_LIFT_E", type: "partition", x1: 0, z1: 5, x2: 0, z2: 35, thickness: 0.5 },
          { id: "G_PART_STAIRS_S_E", type: "partition", x1: 12, z1: 5, x2: 12, z2: 35, thickness: 0.5 },
          // Lift shafts
          { id: "G_LIFT_SHAFT_1", type: "partition", x1: -15, z1: 25, x2: 0, z2: 25, thickness: 0.5 },
          { id: "G_LIFT_SHAFT_DIV", type: "partition", x1: -7.5, z1: 15, x2: -7.5, z2: 35, thickness: 0.5 },
          // South Stair enclosure
          { id: "G_PART_STAIRS_S_ENC", type: "partition", x1: 0, z1: 18, x2: 12, z2: 18, thickness: 0.5 },

          // ==========================================
          // 6. FLUID & 7. SOM LABS
          // ==========================================
          { id: "G_PART_FLUID_E", type: "partition", x1: 35, z1: 5, x2: 35, z2: 35, thickness: 0.5 }
        ],
        doors: [
          // Entrance Vestibule
          { id: "G_DOOR_EXT_W", wallId: "G_WALL_EXT_W", x: -80, z: -20, width: 4 },
          { id: "G_DOOR_ENTRANCE_CORR", wallId: "G_CORR_N_ENTRANCE", x: -65, z: -5, width: 4 },
          
          // Administration
          { id: "G_DOOR_ADMIN_MAIN", wallId: "G_CORR_S_ADMIN_RECEP", x: -70, z: 5, width: 3 },
          
          // Toilets
          { id: "G_DOOR_TOILET_LOBBY", wallId: "G_CORR_N_TOILET_LOBBY", x: -25, z: -5, width: 2 },
          { id: "G_DOOR_BOYS", wallId: "G_PART_TOILET_LOBBY", x: -21.5, z: -15, width: 1.5 },
          { id: "G_DOOR_GIRLS", wallId: "G_CORR_N_GIRLS", x: -7, z: -5, width: 1.5 },
          { id: "G_DOOR_HANDICAP", wallId: "G_CORR_N_HANDICAP", x: -2, z: -5, width: 1.5 },
          
          // Workshop & Labs
          { id: "G_DOOR_WORKSHOP", wallId: "G_CORR_N_WORKSHOP", x: 28.5, z: -5, width: 4 },
          { id: "G_DOOR_RAW", wallId: "G_CORR_N_RAW", x: 50, z: -5, width: 3 },
          { id: "G_DOOR_LATHE", wallId: "G_CORR_N_LATHE", x: 67.5, z: -5, width: 3 },
          { id: "G_DOOR_FLUID", wallId: "G_CORR_S_FLUID", x: 23.5, z: 5, width: 3 },
          { id: "G_DOOR_SOM", wallId: "G_CORR_S_SOM", x: 42.5, z: 5, width: 3 },
          
          // Stairs & Exits
          { id: "G_DOOR_STAIR_N_CORR", wallId: "G_CORR_N_STAIRS", x: 6, z: -5, width: 4 },
          { id: "G_DOOR_STAIR_N", wallId: "G_PART_STAIRS_N_ENC", x: 6, z: -18, width: 2 },
          
          { id: "G_DOOR_STAIR_S_CORR", wallId: "G_CORR_S_STAIRS", x: 6, z: 5, width: 4 },
          { id: "G_DOOR_STAIR_S", wallId: "G_PART_STAIRS_S_ENC", x: 6, z: 18, width: 2 },
          
          { id: "G_DOOR_EAST_EXIT", wallId: "G_WALL_EXT_E", x: 80, z: -20, width: 4 },
          
          // Additional Openings (from arrows)
          { id: "G_DOOR_BLANK_ROOM", wallId: "G_CORR_N_BLANK", x: -39, z: -5, width: 4 },
          
          // Final Arrow Gap
          { id: "G_DOOR_LIFT_SOUTH_ROOM", wallId: "G_CORR_S_LIFT_LOBBY_S", x: -22.5, z: 15, width: 4 }
        ],
        windows: [],
        stairs: [
          { id: "G_STAIRS_MAIN_N", x: 6, z: -26.5, width: 11, depth: 16 },
          { id: "G_STAIRS_MAIN_S", x: 6, z: 26.5, width: 11, depth: 16 },
          { id: "G_STAIRS_EAST_EXIT", x: 75, z: -25, width: 9, depth: 9 }
        ],
        lifts: [
          { id: "G_LIFT_1", x: -11.25, z: 25, width: 7.5, depth: 4 },
          { id: "G_LIFT_2", x: -3.75, z: 25, width: 7.5, depth: 4 }
        ],
        columns: []
      },
      nodes: [
        { id: "G_ENTRANCE", type: "exit", name: "1. Entrance Lobby", x: -65, z: -20 },
        { id: "G_ADMIN", type: "room", name: "2. Administration Block", x: -55, z: 25 },
        { id: "G_BOYS_TOILET", type: "room", name: "3. Boys Toilet", x: -21.5, z: -25 },
        { id: "G_GIRLS_TOILET", type: "room", name: "4. Girls Toilet", x: -7, z: -20 },
        { id: "G_WATER_COOLER", type: "corridor", name: "5. Water Cooler", x: -12.5, z: -6.5 },
        { id: "G_HANDICAP_TOILET", type: "room", name: "6. Handicap Toilet", x: -2, z: -20 },
        { id: "G_LIFT_LOBBY", type: "corridor", name: "7. Lift Lobby", x: -22.5, z: 10 },
        { id: 'G_STAIRS_NODE_N',
          type: 'staircase',
          isExit: true, name: "8a. North Stairs", x: 6, z: -26.5 },
        { id: 'G_STAIRS_NODE_S',
          type: 'staircase',
          isExit: true, name: "8b. South Stairs", x: 6, z: 26.5 },
        { id: "G_CORRIDOR", type: "corridor", name: "9. Central Passageway", x: 0, z: 0 },
        { id: "G_FLUID_LAB", type: "room", name: "10. Fluid Machinery Lab", x: 23.5, z: 20 },
        { id: "G_SOM_LAB", type: "room", name: "11. S.O.M Lab", x: 57.5, z: 20 },
        { id: "G_WORKSHOP", type: "room", name: "12. Workshop", x: 28.5, z: -25 },
        { id: "G_RAW_STORAGE", type: "room", name: "13. Raw Material Storage", x: 50, z: -20 },
        { id: "G_LATHE_SHOP", type: "room", name: "14. Lathe Machine Shop", x: 67.5, z: -20 },
        { id: 'G_EAST_EXIT',
          type: 'staircase',
          isExit: true, name: "15. East Exit", x: 78, z: -20 }
      ,
          // DOOR NODES (M3)
          { id: "G_DOOR_EXT_W_NODE", type: "door", name: "G DOOR EXT W", x: -80, z: -20 },
          { id: "G_DOOR_ENTRANCE_CORR_NODE", type: "door", name: "G DOOR ENTRANCE CORR", x: -65, z: -5 },
          { id: "G_DOOR_ADMIN_MAIN_NODE", type: "door", name: "G DOOR ADMIN MAIN", x: -70, z: 5 },
          { id: "G_DOOR_TOILET_LOBBY_NODE", type: "door", name: "G DOOR TOILET LOBBY", x: -25, z: -5 },
          { id: "G_DOOR_BOYS_NODE", type: "door", name: "G DOOR BOYS", x: -21.5, z: -15 },
          { id: "G_DOOR_GIRLS_NODE", type: "door", name: "G DOOR GIRLS", x: -7, z: -5 },
          { id: "G_DOOR_HANDICAP_NODE", type: "door", name: "G DOOR HANDICAP", x: -2, z: -5 },
          { id: "G_DOOR_WORKSHOP_NODE", type: "door", name: "G DOOR WORKSHOP", x: 28.5, z: -5 },
          { id: "G_DOOR_RAW_NODE", type: "door", name: "G DOOR RAW", x: 50, z: -5 },
          { id: "G_DOOR_LATHE_NODE", type: "door", name: "G DOOR LATHE", x: 67.5, z: -5 },
          { id: "G_DOOR_FLUID_NODE", type: "door", name: "G DOOR FLUID", x: 23.5, z: 5 },
          { id: "G_DOOR_SOM_NODE", type: "door", name: "G DOOR SOM", x: 42.5, z: 5 },
          { id: "G_DOOR_STAIR_N_CORR_NODE", type: "door", name: "G DOOR STAIR N CORR", x: 6, z: -5 },
          { id: "G_DOOR_STAIR_N_NODE", type: "door", name: "G DOOR STAIR N", x: 6, z: -18 },
          { id: "G_DOOR_STAIR_S_CORR_NODE", type: "door", name: "G DOOR STAIR S CORR", x: 6, z: 5 },
          { id: "G_DOOR_STAIR_S_NODE", type: "door", name: "G DOOR STAIR S", x: 6, z: 18 },
          { id: "G_DOOR_EAST_EXIT_NODE", type: "door", name: "G DOOR EAST EXIT", x: 80, z: -20 },
          { id: "G_DOOR_BLANK_ROOM_NODE", type: "door", name: "G DOOR BLANK ROOM", x: -39, z: -5 },
          { id: "G_DOOR_LIFT_SOUTH_ROOM_NODE", type: "door", name: "G DOOR LIFT SOUTH ROOM", x: -22.5, z: 15 }
      ],
      m3Connections: [
          {
            "from": "F2_STAIRS_MAIN_NODE",
            "to": "F2_D_STAIR_NODE"
          },
          {
            "from": "F2_D_STAIR_NODE",
            "to": "F2_STAIRS_MAIN_NODE"
          },
          {
                    "from": "G_ADMIN",
                    "to": "G_DOOR_ADMIN_MAIN_NODE"
          },
          {
                    "from": "G_DOOR_TOILET_LOBBY_NODE",
                    "to": "G_LIFT_LOBBY"
          },
          {
                    "from": "G_BOYS_TOILET",
                    "to": "G_DOOR_BOYS_NODE"
          },
          {
                    "from": "G_GIRLS_TOILET",
                    "to": "G_DOOR_GIRLS_NODE"
          },
          {
                    "from": "G_HANDICAP_TOILET",
                    "to": "G_DOOR_HANDICAP_NODE"
          },
          {
                    "from": "G_WORKSHOP",
                    "to": "G_DOOR_WORKSHOP_NODE"
          },
          {
                    "from": "G_RAW_STORAGE",
                    "to": "G_DOOR_RAW_NODE"
          },
          {
                    "from": "G_LATHE_SHOP",
                    "to": "G_DOOR_LATHE_NODE"
          },
          {
                    "from": "G_FLUID_LAB",
                    "to": "G_DOOR_FLUID_NODE"
          },
          {
                    "from": "G_SOM_LAB",
                    "to": "G_DOOR_SOM_NODE"
          },
          {
                    "from": "G_STAIRS_NODE_N",
                    "to": "G_DOOR_STAIR_N_NODE"
          },
          {
                    "from": "G_STAIRS_NODE_S",
                    "to": "G_DOOR_STAIR_S_NODE"
          },
          {
                    "from": "G_LATHE_SHOP",
                    "to": "G_DOOR_EAST_EXIT_NODE"
          },
          {
                    "from": "G_DOOR_BLANK_ROOM_NODE",
                    "to": "G_LIFT_LOBBY"
          },
          {
                    "from": "G_DOOR_LIFT_SOUTH_ROOM_NODE",
                    "to": "G_LIFT_LOBBY"
          },
          {
                    "from": "G_WATER_COOLER",
                    "to": "G_LIFT_LOBBY"
          },
          {
                    "from": "G_DOOR_EAST_EXIT_NODE",
                    "to": "G_EAST_EXIT"
          },
          {
                    "from": "G_DOOR_ENTRANCE_CORR_NODE",
                    "to": "G_ENTRANCE"
          },
          {
                    "from": "G_DOOR_EXT_W_NODE",
                    "to": "G_DOOR_ENTRANCE_CORR_NODE"
          },
          {
                    "from": "G_DOOR_EAST_EXIT_NODE",
                    "to": "G_DOOR_LATHE_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_ENTRANCE_CORR_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_ADMIN_MAIN_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_TOILET_LOBBY_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_GIRLS_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_HANDICAP_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_WORKSHOP_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_RAW_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_LATHE_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_FLUID_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_SOM_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_STAIR_N_CORR_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_STAIR_S_CORR_NODE"
          },
          {
                    "from": "G_CORRIDOR",
                    "to": "G_DOOR_BLANK_ROOM_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_ADMIN_MAIN_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_WORKSHOP_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_RAW_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_LATHE_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_FLUID_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_SOM_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_STAIR_N_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_N_CORR_NODE",
                    "to": "G_DOOR_STAIR_S_CORR_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_WATER_COOLER"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_ENTRANCE_CORR_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_ADMIN_MAIN_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_TOILET_LOBBY_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_GIRLS_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_HANDICAP_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_WORKSHOP_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_RAW_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_LATHE_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_STAIR_S_NODE"
          },
          {
                    "from": "G_DOOR_STAIR_S_CORR_NODE",
                    "to": "G_DOOR_BLANK_ROOM_NODE"
          }
],
      m2Connections: [
        { from: "G_ADMIN", via: "G_DOOR_ADMIN_MAIN", to: "G_CORRIDOR" },
        { from: "G_WORKSHOP", via: "G_DOOR_WORKSHOP", to: "G_CORRIDOR" },
        { from: "G_RAW_STORAGE", via: "G_DOOR_RAW", to: "G_CORRIDOR" },
        { from: "G_LATHE_SHOP", via: "G_DOOR_LATHE", to: "G_CORRIDOR" },
        { from: "G_FLUID_LAB", via: "G_DOOR_FLUID", to: "G_CORRIDOR" },
        { from: "G_SOM_LAB", via: "G_DOOR_SOM", to: "G_CORRIDOR" },
        
        { from: "G_BOYS_TOILET", via: "G_DOOR_BOYS", to: "G_CORRIDOR" },
        { from: "G_GIRLS_TOILET", via: "G_DOOR_GIRLS", to: "G_CORRIDOR" },
        { from: "G_HANDICAP_TOILET", via: "G_DOOR_HANDICAP", to: "G_CORRIDOR" },
        
        { from: "G_WATER_COOLER", via: "OPEN", to: "G_CORRIDOR" },
        { from: "G_LIFT_LOBBY", via: "OPEN", to: "G_CORRIDOR" },

        { from: "G_ENTRANCE", via: "G_DOOR_ENTRANCE_CORR", to: "G_CORRIDOR" },
        { from: "G_ENTRANCE", via: "G_DOOR_EXT_W", to: "OUTSIDE" },
        
        { from: "G_CORRIDOR", via: "G_DOOR_STAIR_N", to: "G_STAIRS_NODE_N" },
        { from: "G_CORRIDOR", via: "G_DOOR_STAIR_S", to: "G_STAIRS_NODE_S" },
        { from: "G_CORRIDOR", via: "G_DOOR_EAST_EXIT", to: "G_EAST_EXIT" }
      ]
    },
    {
      level: 1,
      name: "First Floor",
      metadata: { source: "Official First Floor Blueprint converted_page_1.png", verified: false },
      units: "meters",
      elevation: 10.0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
          // ==========================================
          // 1. OUTER ENVELOPE (with Drawing Hall South Projection & Toilet Recess)
          // ==========================================
          // North Boundary (recessed at Toilet core: x: -20 to 10, z: -28)
          { id: "F1_EXT_N_LEFT",      type: "exterior", x1: -80, z1: -35, x2: -20, z2: -35, thickness: 0.5 },
          { id: "F1_EXT_N_RECESS_W",  type: "exterior", x1: -20, z1: -35, x2: -20, z2: -28, thickness: 0.5 }, // Toilet recess west step
          { id: "F1_EXT_N_RECESS",    type: "exterior", x1: -20, z1: -28, x2:  10, z2: -28, thickness: 0.5 }, // Toilet core north wall
          { id: "F1_EXT_N_RECESS_E",  type: "exterior", x1:  10, z1: -28, x2:  10, z2: -35, thickness: 0.5 }, // Toilet recess east step
          { id: "F1_EXT_N_RIGHT",     type: "exterior", x1:  10, z1: -35, x2:  80, z2: -35, thickness: 0.5 },

          // South Boundary (with prominent Drawing Hall projection at x: 12 to 45, extending to z: 46)
          { id: "F1_EXT_S_WEST",      type: "exterior", x1: -80, z1:  35, x2: -15, z2:  35, thickness: 0.5 },
          { id: "F1_EXT_S_CORE_W",    type: "exterior", x1: -15, z1:  35, x2: -15, z2:  30, thickness: 0.5 }, // Core step
          { id: "F1_EXT_S_CORE",      type: "exterior", x1: -15, z1:  30, x2:  12, z2:  30, thickness: 0.5 }, // Lift/Stair core south wall
          { id: "F1_EXT_S_CORE_E",    type: "exterior", x1:  12, z1:  30, x2:  12, z2:  46, thickness: 0.5 }, // Step out to Drawing Hall
          { id: "F1_EXT_DRAWING_S",   type: "exterior", x1:  12, z1:  46, x2:  45, z2:  46, thickness: 0.5 }, // Drawing Hall south projected wall
          { id: "F1_EXT_DRAWING_E",   type: "exterior", x1:  45, z1:  46, x2:  45, z2:  35, thickness: 0.5 }, // Step back to baseline south
          { id: "F1_EXT_S_EAST",      type: "exterior", x1:  45, z1:  35, x2:  80, z2:  35, thickness: 0.5 },

          // West & East Boundaries
          { id: "F1_EXT_W",           type: "exterior", x1: -80, z1: -35, x2: -80, z2:  35, thickness: 0.5 },
          { id: "F1_EXT_E",           type: "exterior", x1:  80, z1: -35, x2:  80, z2:  35, thickness: 0.5 },

          // ==========================================
          // 2. CENTRAL HORIZONTAL PASSAGE (Corridor z = -5 to z = 5)
          // ==========================================
          { id: "F1_CORR_N",          type: "partition", x1: -80, z1: -5, x2:  80, z2: -5, thickness: 0.5 },
          { id: "F1_CORR_S",          type: "partition", x1: -80, z1:  5, x2:  80, z2:  5, thickness: 0.5 },

          // ==========================================
          // 3. NORTH ZONE: ROOM PARTITIONS (z = -35 to -5)
          // ==========================================
          // West Wing: Class Room 101 & Faculty 101
          { id: "F1_PART_W_EXT",      type: "partition", x1: -50, z1: -35, x2: -50, z2: -5, thickness: 0.5 }, // CR101/Fac | Chemistry
          { id: "F1_PART_CR101_FAC",  type: "partition", x1: -80, z1: -18, x2: -50, z2: -18, thickness: 0.5 }, // CR101 (N) | Faculty 101 (S)

          // Chemistry & Physics Lab Block (x: -50 to -20)
          { id: "F1_PART_LAB_E",      type: "partition", x1: -20, z1: -35, x2: -20, z2: -5, thickness: 0.5 }, // Physics/Chem | Toilet core
          { id: "F1_PART_CHEM_PHYS",  type: "partition", x1: -50, z1: -20, x2: -20, z2: -20, thickness: 0.5 }, // Chemistry Lab (N) | Physics Lab (S)
          { id: "F1_PART_PREP_ROOM",  type: "partition", x1: -50, z1: -28, x2: -40, z2: -28, thickness: 0.5 }, // Prep / Dark room divider
          { id: "F1_PART_PREP_ROOM_V", type: "partition", x1: -40, z1: -35, x2: -40, z2: -28, thickness: 0.5 }, // Prep room east wall

          // Central Toilet & AHU Core (x: -20 to 10)
          { id: "F1_PART_TOILET_E",   type: "partition", x1:  10, z1: -35, x2:  10, z2: -5, thickness: 0.5 }, // Toilet core | Computer block
          { id: "F1_PART_AHU_1",      type: "partition", x1: -12, z1: -28, x2: -12, z2: -5, thickness: 0.5 }, // AHU-1 partition
          { id: "F1_PART_TOILET_BOYS",type: "partition", x1:  -2, z1: -28, x2:  -2, z2: -5, thickness: 0.5 }, // Boys | Girls toilet
          { id: "F1_PART_TOILET_GIRLS",type: "partition", x1:  4, z1: -28, x2:   4, z2: -5, thickness: 0.5 }, // Girls | Handicap/Water

          // East Labs & Computer Room Block (x: 10 to 55)
          { id: "F1_PART_CR104_COMP", type: "partition", x1:  30, z1: -35, x2:  30, z2: -5, thickness: 0.5 }, // CR104/HOD | Computer/SEE
          { id: "F1_PART_MID_LAB_E",  type: "partition", x1:  55, z1: -35, x2:  55, z2: -5, thickness: 0.5 }, // Computer/SEE | East Classrooms
          { id: "F1_PART_CR104_HOD",  type: "partition", x1:  10, z1: -20, x2:  30, z2: -20, thickness: 0.5 }, // CR104 (N) | Faculty/HOD (S)
          { id: "F1_PART_COMP_SEE",   type: "partition", x1:  30, z1: -20, x2:  55, z2: -20, thickness: 0.5 }, // Computer Room (N) | S.E.E. Lab (S)

          // East Classroom Wing (x: 55 to 80)
          { id: "F1_PART_CR105_CR106",type: "partition", x1:  55, z1: -20, x2:  80, z2: -20, thickness: 0.5 }, // CR105 (N) | CR106 (S)

          // ==========================================
          // 4. SOUTH ZONE: ROOM PARTITIONS (z = 5 to 35 / 46)
          // ==========================================
          // West Wing: Faculty 102 & Tutorial Rooms 1 & 2 (x: -80 to -40)
          { id: "F1_PART_W_TUT_E",    type: "partition", x1: -40, z1:   5, x2: -40, z2:  35, thickness: 0.5 }, // Tutorials | CR102/103
          { id: "F1_PART_FAC102_TUT1",type: "partition", x1: -80, z1:  15, x2: -40, z2:  15, thickness: 0.5 }, // Faculty 102 | Tutorial 1
          { id: "F1_PART_TUT1_TUT2",  type: "partition", x1: -80, z1:  25, x2: -40, z2:  25, thickness: 0.5 }, // Tutorial 1 | Tutorial 2

          // Classrooms 102 & 103 (x: -40 to -15)
          { id: "F1_PART_CR102_E",    type: "partition", x1: -15, z1:   5, x2: -15, z2:  35, thickness: 0.5 }, // CR102/103 | Core
          { id: "F1_PART_CR102_CR103",type: "partition", x1: -40, z1:  20, x2: -15, z2:  20, thickness: 0.5 }, // CR102 (N) | CR103 (S)

          // Central Vertical Circulation Core (x: -15 to 12)
          { id: "F1_PART_CORE_DIV",   type: "partition", x1:   2, z1:   5, x2:   2, z2:  30, thickness: 0.5 }, // Main Stairwell | Lifts/Server
          { id: "F1_PART_SERVER_ROOM",type: "partition", x1:   2, z1:  22, x2:  12, z2:  22, thickness: 0.5 }, // Lifts | Server room / Duct

          // Drawing Hall Enclosure (x: 12 to 45, z: 5 to 46)
          { id: "F1_PART_DRAWING_W",  type: "partition", x1:  12, z1:   5, x2:  12, z2:  30, thickness: 0.5 }, // Drawing Hall west wall
          { id: "F1_PART_DRAWING_E",  type: "partition", x1:  45, z1:   5, x2:  45, z2:  35, thickness: 0.5 }, // Drawing Hall east wall | APM Lab

          // A.P.M. Laboratory Block (x: 45 to 55)
          { id: "F1_PART_APM_E",      type: "partition", x1:  55, z1:   5, x2:  55, z2:  35, thickness: 0.5 }, // APM Lab | East Classrooms
          { id: "F1_PART_AHU_2",      type: "partition", x1:  45, z1:  22, x2:  55, z2:  22, thickness: 0.5 }, // APM Lab | AHU-2

          // East Classroom Wing (x: 55 to 80)
          { id: "F1_PART_CR107_CR108",type: "partition", x1:  55, z1:  20, x2:  80, z2:  20, thickness: 0.5 }  // CR107 (N) | CR108 (S)
        ],
        doors: [
          // NORTH ZONE ROOMS (Wall: F1_CORR_N, z = -5)
          { id: "F1_DOOR_FAC101", wallId: "F1_CORR_N", x: -65, z: -5, width: 2 }, // Faculty 101
          { id: "F1_DOOR_PHYSICS", wallId: "F1_CORR_N", x: -35, z: -5, width: 3 }, // Physics/Chem Lab
          { id: "F1_DOOR_TOILET", wallId: "F1_CORR_N", x: -5, z: -5, width: 4 }, // Central Toilet Core
          { id: "F1_DOOR_HOD", wallId: "F1_CORR_N", x: 20, z: -5, width: 2 }, // HOD / Faculty
          { id: "F1_DOOR_SEE_LAB", wallId: "F1_CORR_N", x: 42.5, z: -5, width: 3 }, // S.E.E Lab / Computer Room
          { id: "F1_DOOR_CR106", wallId: "F1_CORR_N", x: 67.5, z: -5, width: 2 }, // CR106 Wing
          
          // SOUTH ZONE ROOMS (Wall: F1_CORR_S, z = 5)
          { id: "F1_DOOR_FAC102", wallId: "F1_CORR_S", x: -60, z: 5, width: 2 }, // Faculty 102 / Tutorials
          { id: "F1_DOOR_CR102", wallId: "F1_CORR_S", x: -27.5, z: 5, width: 2 }, // CR102 / CR103
          { id: "F1_DOOR_CORE_STAIRS", wallId: "F1_CORR_S", x: -1.5, z: 5, width: 6 }, // Main Stair & Lift Core Access
          { id: "F1_DOOR_DRAWING", wallId: "F1_CORR_S", x: 28.5, z: 5, width: 4 }, // Drawing Hall
          { id: "F1_DOOR_APM", wallId: "F1_CORR_S", x: 50, z: 5, width: 2 }, // A.P.M Laboratory
          { id: "F1_DOOR_CR107", wallId: "F1_CORR_S", x: 67.5, z: 5, width: 2 }, // CR107 Wing

          // INNER PARTITION GAPS (FROM GREEN ARROWS)
          // North Row Inner Gaps
          { id: "F1_DOOR_CR101_FAC", wallId: "F1_PART_CR101_FAC", x: -65, z: -18, width: 2 },
          { id: "F1_DOOR_CHEM_PHYS", wallId: "F1_PART_CHEM_PHYS", x: -35, z: -20, width: 2 },
          { id: "F1_DOOR_CR104_HOD", wallId: "F1_PART_CR104_HOD", x: 20, z: -20, width: 2 },
          { id: "F1_DOOR_COMP_SEE", wallId: "F1_PART_COMP_SEE", x: 42.5, z: -20, width: 2 },
          { id: "F1_DOOR_CR105_CR106", wallId: "F1_PART_CR105_CR106", x: 67.5, z: -20, width: 2 },

          // South Row Inner Gaps
          { id: "F1_DOOR_TUT1_TUT2", wallId: "F1_PART_TUT1_TUT2", x: -60, z: 25, width: 2 },
          { id: "F1_DOOR_FAC102_TUT1", wallId: "F1_PART_FAC102_TUT1", x: -60, z: 15, width: 2 },
          { id: "F1_DOOR_CR102_CR103", wallId: "F1_PART_CR102_CR103", x: -27.5, z: 20, width: 2 },
          { id: "F1_DOOR_SERVER_STAIRS", wallId: "F1_PART_CORE_DIV", x: 2, z: 17.5, width: 2 },
          { id: "F1_DOOR_CR107_CR108", wallId: "F1_PART_CR107_CR108", x: 67.5, z: 20, width: 2 },

          // UTILITY ROOM GAPS (FROM ARROWS)
          { id: "F1_DOOR_AHU1", wallId: "F1_PART_AHU_1", x: -12, z: -16, width: 2 },
          { id: "F1_DOOR_SERVER", wallId: "F1_PART_SERVER_ROOM", x: 7, z: 22, width: 2 },
          { id: "F1_DOOR_AHU2", wallId: "F1_PART_AHU_2", x: 50, z: 22, width: 2 },

          // VERTICAL PARTITION GAPS (FROM NEW ARROWS)
          { id: "F1_DOOR_PREP_CHEM", wallId: "F1_PART_PREP_ROOM_V", x: -40, z: -31.5, width: 2 },
          { id: "F1_DOOR_BOYS_GIRLS", wallId: "F1_PART_TOILET_BOYS", x: -2, z: -16, width: 2 },
          { id: "F1_DOOR_GIRLS_HANDICAP", wallId: "F1_PART_TOILET_GIRLS", x: 4, z: -16, width: 2 },
          { id: "F1_DOOR_CR102_CORE", wallId: "F1_PART_CR102_E", x: -15, z: 12, width: 2 },
          { id: "F1_DOOR_DRAWING_APM", wallId: "F1_PART_DRAWING_E", x: 45, z: 15, width: 2 }
        ],
        windows: [],
        stairs: [
          // 1. Main central staircase (South Core)
          { id: "F1_STAIRS_MAIN",      x: -6.5, z: 18.0, width: 12, depth: 18 },
          // 2. West Wing staircase (South corridor opening)
          { id: "F1_STAIRS_WEST",      x: -45.0, z:  0.0, width: 8, depth: 8 },
          // 3. East Wing staircase (East corridor opening)
          { id: "F1_STAIRS_EAST",      x:  65.0, z:  0.0, width: 8, depth: 8 }
        ],
        lifts: [
          // Four lifts in South Central Core (x: 2 to 12, z: 7 to 21)
          { id: "F1_LIFT_1", x:  6.0, z:  9.0, width: 4, depth: 4 },
          { id: "F1_LIFT_2", x:  6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F1_LIFT_3", x: 10.5, z:  9.0, width: 4, depth: 4 },
          { id: "F1_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
        columns: []
      },
      nodes: [
        // Rooms - North Side
        { id: "F1_CR101", type: "room", name: "CR101", x: -65, z: -26 },
        { id: "F1_FAC101", type: "room", name: "Faculty 101", x: -65, z: -11 },
        { id: "F1_CHEM_LAB", type: "room", name: "Chemistry Lab", x: -35, z: -27 },
        { id: "F1_PHYS_LAB", type: "room", name: "Physics Lab", x: -35, z: -12 },
        { id: "F1_PREP_ROOM", type: "room", name: "Prep Room", x: -45, z: -31 },
        { id: "F1_TOILET_BOYS", type: "room", name: "Boys Toilet", x: -6, z: -16 },
        { id: "F1_TOILET_GIRLS", type: "room", name: "Girls Toilet", x: 1, z: -16 },
        { id: "F1_CR104_HOD", type: "room", name: "CR104 / HOD", x: 20, z: -27 },
        { id: "F1_COMP_ROOM", type: "room", name: "Computer Room", x: 42, z: -27 },
        { id: "F1_SEE_LAB", type: "room", name: "S.E.E. Lab", x: 42, z: -12 },
        { id: "F1_CR105", type: "room", name: "CR105", x: 67, z: -27 },
        { id: "F1_CR106", type: "room", name: "CR106", x: 67, z: -12 },

        // Rooms - South Side
        { id: "F1_FAC102", type: "room", name: "Faculty 102", x: -60, z: 10 },
        { id: "F1_TUT1", type: "room", name: "Tutorial 1", x: -60, z: 20 },
        { id: "F1_TUT2", type: "room", name: "Tutorial 2", x: -60, z: 30 },
        { id: "F1_CR102", type: "room", name: "CR102", x: -27, z: 12 },
        { id: "F1_CR103", type: "room", name: "CR103", x: -27, z: 27 },
        { id: "F1_SERVER", type: "room", name: "Server Room", x: 7, z: 26 },
        { id: "F1_DRAWING", type: "room", name: "Drawing Hall", x: 28, z: 25 },
        { id: "F1_APM_LAB", type: "room", name: "A.P.M. Lab", x: 50, z: 13 },
        { id: "F1_CR107", type: "room", name: "CR107", x: 67, z: 12 },
        { id: "F1_CR108", type: "room", name: "CR108", x: 67, z: 27 },

        // Corridors
        { id: "F1_CORRIDOR_WEST", type: "corridor", name: "West Corridor", x: -50, z: 0 },
        { id: "F1_CORRIDOR_CENTER", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
        { id: "F1_CORRIDOR_EAST", type: "corridor", name: "East Corridor", x: 50, z: 0 },

        // Stairs
        { id: "F1_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
        { id: "F1_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
        { id: 'F1_STAIRS_EAST_NODE',
          type: 'corridor', name: "East Stairs", x: 65, z: 0 },

        // Exits (Floor egress points at the stairwells)
        { id: "F1_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
        { id: "F1_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 },
        { id: "F1_EXIT_EAST", type: "exit", name: "East Egress", x: 58, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F1_DOOR_FAC101_NODE", type: "door", name: "F1 DOOR FAC101", x: -65, z: -5 },
          { id: "F1_DOOR_PHYSICS_NODE", type: "door", name: "F1 DOOR PHYSICS", x: -35, z: -5 },
          { id: "F1_DOOR_TOILET_NODE", type: "door", name: "F1 DOOR TOILET", x: -5, z: -5 },
          { id: "F1_DOOR_HOD_NODE", type: "door", name: "F1 DOOR HOD", x: 20, z: -5 },
          { id: "F1_DOOR_SEE_LAB_NODE", type: "door", name: "F1 DOOR SEE LAB", x: 42.5, z: -5 },
          { id: "F1_DOOR_CR106_NODE", type: "door", name: "F1 DOOR CR106", x: 67.5, z: -5 },
          { id: "F1_DOOR_FAC102_NODE", type: "door", name: "F1 DOOR FAC102", x: -60, z: 5 },
          { id: "F1_DOOR_CR102_NODE", type: "door", name: "F1 DOOR CR102", x: -27.5, z: 5 },
          { id: "F1_DOOR_CORE_STAIRS_NODE", type: "door", name: "F1 DOOR CORE STAIRS", x: -1.5, z: 5 },
          { id: "F1_DOOR_DRAWING_NODE", type: "door", name: "F1 DOOR DRAWING", x: 28.5, z: 5 },
          { id: "F1_DOOR_APM_NODE", type: "door", name: "F1 DOOR APM", x: 50, z: 5 },
          { id: "F1_DOOR_CR107_NODE", type: "door", name: "F1 DOOR CR107", x: 67.5, z: 5 },
          { id: "F1_DOOR_CR101_FAC_NODE", type: "door", name: "F1 DOOR CR101 FAC", x: -65, z: -18 },
          { id: "F1_DOOR_CHEM_PHYS_NODE", type: "door", name: "F1 DOOR CHEM PHYS", x: -35, z: -20 },
          { id: "F1_DOOR_CR104_HOD_NODE", type: "door", name: "F1 DOOR CR104 HOD", x: 20, z: -20 },
          { id: "F1_DOOR_COMP_SEE_NODE", type: "door", name: "F1 DOOR COMP SEE", x: 42.5, z: -20 },
          { id: "F1_DOOR_CR105_CR106_NODE", type: "door", name: "F1 DOOR CR105 CR106", x: 67.5, z: -20 },
          { id: "F1_DOOR_TUT1_TUT2_NODE", type: "door", name: "F1 DOOR TUT1 TUT2", x: -60, z: 25 },
          { id: "F1_DOOR_FAC102_TUT1_NODE", type: "door", name: "F1 DOOR FAC102 TUT1", x: -60, z: 15 },
          { id: "F1_DOOR_CR102_CR103_NODE", type: "door", name: "F1 DOOR CR102 CR103", x: -27.5, z: 20 },
          { id: "F1_DOOR_SERVER_STAIRS_NODE", type: "door", name: "F1 DOOR SERVER STAIRS", x: 2, z: 17.5 },
          { id: "F1_DOOR_CR107_CR108_NODE", type: "door", name: "F1 DOOR CR107 CR108", x: 67.5, z: 20 },
          { id: "F1_DOOR_AHU1_NODE", type: "door", name: "F1 DOOR AHU1", x: -12, z: -16 },
          { id: "F1_DOOR_SERVER_NODE", type: "door", name: "F1 DOOR SERVER", x: 7, z: 22 },
          { id: "F1_DOOR_AHU2_NODE", type: "door", name: "F1 DOOR AHU2", x: 50, z: 22 },
          { id: "F1_DOOR_PREP_CHEM_NODE", type: "door", name: "F1 DOOR PREP CHEM", x: -40, z: -31.5 },
          { id: "F1_DOOR_BOYS_GIRLS_NODE", type: "door", name: "F1 DOOR BOYS GIRLS", x: -2, z: -16 },
          { id: "F1_DOOR_GIRLS_HANDICAP_NODE", type: "door", name: "F1 DOOR GIRLS HANDICAP", x: 4, z: -16 },
          { id: "F1_DOOR_CR102_CORE_NODE", type: "door", name: "F1 DOOR CR102 CORE", x: -15, z: 12 },
          { id: "F1_DOOR_DRAWING_APM_NODE", type: "door", name: "F1 DOOR DRAWING APM", x: 45, z: 15 }
      ],
      m3Connections: [
          {
                    "from": "F1_FAC101",
                    "to": "F1_DOOR_FAC101_NODE"
          },
          {
                    "from": "F1_DOOR_FAC101_NODE",
                    "to": "F1_CORRIDOR_WEST"
          },
          {
                    "from": "F1_PHYS_LAB",
                    "to": "F1_DOOR_PHYSICS_NODE"
          },
          {
                    "from": "F1_DOOR_PHYSICS_NODE",
                    "to": "F1_CORRIDOR_WEST"
          },
          {
                    "from": "F1_TOILET_BOYS",
                    "to": "F1_DOOR_TOILET_NODE"
          },
          {
                    "from": "F1_DOOR_TOILET_NODE",
                    "to": "F1_CORRIDOR_CENTER"
          },
          {
                    "from": "F1_STAIRS_EAST_NODE",
                    "to": "F1_DOOR_HOD_NODE"
          },
          {
                    "from": "F1_DOOR_HOD_NODE",
                    "to": "F1_CORRIDOR_CENTER"
          },
          {
                    "from": "F1_SEE_LAB",
                    "to": "F1_DOOR_SEE_LAB_NODE"
          },
          {
                    "from": "F1_DOOR_SEE_LAB_NODE",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_STAIRS_EAST_NODE",
                    "to": "F1_DOOR_CR106_NODE"
          },
          {
                    "from": "F1_DOOR_CR106_NODE",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_FAC102",
                    "to": "F1_DOOR_FAC102_NODE"
          },
          {
                    "from": "F1_DOOR_FAC102_NODE",
                    "to": "F1_CORRIDOR_WEST"
          },
          {
                    "from": "F1_CR102",
                    "to": "F1_DOOR_CR102_NODE"
          },
          {
                    "from": "F1_DOOR_CR102_NODE",
                    "to": "F1_CORRIDOR_WEST"
          },
          {
                    "from": "F1_STAIRS_MAIN_NODE",
                    "to": "F1_DOOR_CORE_STAIRS_NODE"
          },
          {
                    "from": "F1_DOOR_CORE_STAIRS_NODE",
                    "to": "F1_CORRIDOR_CENTER"
          },
          {
                    "from": "F1_DRAWING",
                    "to": "F1_DOOR_DRAWING_NODE"
          },
          {
                    "from": "F1_DOOR_DRAWING_NODE",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_APM_LAB",
                    "to": "F1_DOOR_APM_NODE"
          },
          {
                    "from": "F1_DOOR_APM_NODE",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_STAIRS_EAST_NODE",
                    "to": "F1_DOOR_CR107_NODE"
          },
          {
                    "from": "F1_DOOR_CR107_NODE",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_FAC101",
                    "to": "F1_DOOR_CR101_FAC_NODE"
          },
          {
                    "from": "F1_DOOR_CR101_FAC_NODE",
                    "to": "F1_CR101"
          },
          {
                    "from": "F1_CHEM_LAB",
                    "to": "F1_DOOR_CHEM_PHYS_NODE"
          },
          {
                    "from": "F1_DOOR_CHEM_PHYS_NODE",
                    "to": "F1_PHYS_LAB"
          },
          {
                    "from": "F1_CR104_HOD",
                    "to": "F1_DOOR_CR104_HOD_NODE"
          },
          {
                    "from": "F1_COMP_ROOM",
                    "to": "F1_DOOR_COMP_SEE_NODE"
          },
          {
                    "from": "F1_DOOR_COMP_SEE_NODE",
                    "to": "F1_SEE_LAB"
          },
          {
                    "from": "F1_CR105",
                    "to": "F1_DOOR_CR105_CR106_NODE"
          },
          {
                    "from": "F1_DOOR_CR105_CR106_NODE",
                    "to": "F1_CR106"
          },
          {
                    "from": "F1_TUT1",
                    "to": "F1_DOOR_TUT1_TUT2_NODE"
          },
          {
                    "from": "F1_DOOR_TUT1_TUT2_NODE",
                    "to": "F1_TUT2"
          },
          {
                    "from": "F1_FAC102",
                    "to": "F1_DOOR_FAC102_TUT1_NODE"
          },
          {
                    "from": "F1_DOOR_FAC102_TUT1_NODE",
                    "to": "F1_TUT1"
          },
          {
                    "from": "F1_CR103",
                    "to": "F1_DOOR_CR102_CR103_NODE"
          },
          {
                    "from": "F1_DOOR_CR102_CR103_NODE",
                    "to": "F1_CR102"
          },
          {
                    "from": "F1_STAIRS_MAIN_NODE",
                    "to": "F1_DOOR_SERVER_STAIRS_NODE"
          },
          {
                    "from": "F1_CR108",
                    "to": "F1_DOOR_CR107_CR108_NODE"
          },
          {
                    "from": "F1_DOOR_CR107_CR108_NODE",
                    "to": "F1_CR107"
          },
          {
                    "from": "F1_TOILET_BOYS",
                    "to": "F1_DOOR_AHU1_NODE"
          },
          {
                    "from": "F1_SERVER",
                    "to": "F1_DOOR_SERVER_NODE"
          },
          {
                    "from": "F1_APM_LAB",
                    "to": "F1_DOOR_AHU2_NODE"
          },
          {
                    "from": "F1_PREP_ROOM",
                    "to": "F1_DOOR_PREP_CHEM_NODE"
          },
          {
                    "from": "F1_DOOR_PREP_CHEM_NODE",
                    "to": "F1_CHEM_LAB"
          },
          {
                    "from": "F1_TOILET_GIRLS",
                    "to": "F1_DOOR_BOYS_GIRLS_NODE"
          },
          {
                    "from": "F1_DOOR_BOYS_GIRLS_NODE",
                    "to": "F1_TOILET_BOYS"
          },
          {
                    "from": "F1_TOILET_GIRLS",
                    "to": "F1_DOOR_GIRLS_HANDICAP_NODE"
          },
          {
                    "from": "F1_STAIRS_MAIN_NODE",
                    "to": "F1_DOOR_CR102_CORE_NODE"
          },
          {
                    "from": "F1_DOOR_CR102_CORE_NODE",
                    "to": "F1_CR102"
          },
          {
                    "from": "F1_APM_LAB",
                    "to": "F1_DOOR_DRAWING_APM_NODE"
          },
          {
                    "from": "F1_DOOR_DRAWING_APM_NODE",
                    "to": "F1_DRAWING"
          },
          {
                    "from": "F1_STAIRS_MAIN_NODE",
                    "to": "F1_EXIT_MAIN"
          },
          {
                    "from": "F1_STAIRS_WEST_NODE",
                    "to": "F1_EXIT_WEST"
          },
          {
                    "from": "F1_STAIRS_EAST_NODE",
                    "to": "F1_EXIT_EAST"
          },
          {
                    "from": "F1_CORRIDOR_WEST",
                    "to": "F1_CORRIDOR_CENTER"
          },
          {
                    "from": "F1_CORRIDOR_WEST",
                    "to": "F1_CORRIDOR_EAST"
          },
          {
                    "from": "F1_CORRIDOR_CENTER",
                    "to": "F1_CORRIDOR_EAST"
          }
],
    },
    {
      level: 2,
      name: "Second Floor",
      units: "meters",
      elevation: 15.0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
          // =====================
          // 1. OUTER FOOTPRINT (with genuine recesses)
          // =====================
          // North Boundary (recessed at U3)
          { id: "F2_EXT_N_LEFT", type: "exterior", x1: -80, z1: -35, x2: -20, z2: -35, thickness: 0.5 },
          { id: "F2_EXT_N_RECESS_W", type: "exterior", x1: -20, z1: -35, x2: -20, z2: -28, thickness: 0.5 }, // steps inward
          { id: "F2_EXT_N_RECESS", type: "exterior", x1: -20, z1: -28, x2:  10, z2: -28, thickness: 0.5 }, // Toilet block
          { id: "F2_EXT_N_RECESS_E", type: "exterior", x1:  10, z1: -28, x2:  10, z2: -35, thickness: 0.5 }, // steps outward
          { id: "F2_EXT_N_RIGHT", type: "exterior", x1:  10, z1: -35, x2:  80, z2: -35, thickness: 0.5 },
          
          // South Boundary (recessed at L3)
          { id: "F2_EXT_S_LEFT", type: "exterior", x1: -80, z1:  35, x2: -15, z2:  35, thickness: 0.5 },
          { id: "F2_EXT_S_RECESS_W", type: "exterior", x1: -15, z1:  35, x2: -15, z2:  30, thickness: 0.5 }, // steps inward
          { id: "F2_EXT_S_RECESS", type: "exterior", x1: -15, z1:  30, x2:  15, z2:  30, thickness: 0.5 }, // Lift Lobby core
          { id: "F2_EXT_S_RECESS_E", type: "exterior", x1:  15, z1:  30, x2:  15, z2:  35, thickness: 0.5 }, // steps outward
          { id: "F2_EXT_S_RIGHT", type: "exterior", x1:  15, z1:  35, x2:  80, z2:  35, thickness: 0.5 },

          // East & West Boundaries
          { id: "F2_EXT_W", type: "exterior", x1: -80, z1: -35, x2: -80, z2:  35, thickness: 0.5 },
          { id: "F2_EXT_E", type: "exterior", x1:  80, z1: -35, x2:  80, z2:  35, thickness: 0.5 },

          // =====================
          // 2. CENTRAL HORIZONTAL PASSAGE
          // =====================
          { id: "F2_CORR_N", type: "partition", x1: -80, z1: -5, x2:  80, z2: -5, thickness: 0.5 },
          { id: "F2_CORR_S", type: "partition", x1: -80, z1:  5, x2:  80, z2:  5, thickness: 0.5 },

          // =====================
          // 3. UPPER ROW: STRUCTURAL BLOCKS & ROOMS
          // =====================
          // Block U1
          { id: "F2_UP_U1_U2", type: "partition", x1: -50, z1: -35, x2: -50, z2: -5, thickness: 0.5 }, // U1 | U2 
          { id: "F2_UP_U1_DIV", type: "partition", x1: -80, z1: -20, x2: -50, z2: -20, thickness: 0.5 }, // Classroom-2 | Faculty Room
          
          // Block U2
          { id: "F2_UP_U2_U3", type: "partition", x1: -20, z1: -35, x2: -20, z2: -5, thickness: 0.5 }, // U2 | U3
          { id: "F2_UP_U2_DIV", type: "partition", x1: -50, z1: -20, x2: -20, z2: -20, thickness: 0.5 }, // Elec Lab 1 | Elec Lab 2
          
          // Block U3 (Toilet Block)
          { id: "F2_UP_U3_U4", type: "partition", x1:  10, z1: -35, x2:  10, z2: -5, thickness: 0.5 }, // U3 | U4
          { id: "F2_UP_U3_AHU", type: "partition", x1: -12, z1: -28, x2: -12, z2: -5, thickness: 0.5 }, // AHU Room partition
          { id: "F2_UP_U3_TOILET1", type: "partition", x1: -2, z1: -28, x2: -2, z2: -5, thickness: 0.5 }, // Boys | Girls
          { id: "F2_UP_U3_TOILET2", type: "partition", x1:  4, z1: -28, x2:  4, z2: -5, thickness: 0.5 }, // Girls | Water Cooler/Handicap
          
          // Block U4
          { id: "F2_UP_U4_U5", type: "partition", x1:  40, z1: -35, x2:  40, z2: -5, thickness: 0.5 }, // U4 | U5
          { id: "F2_UP_U4_DIV", type: "partition", x1:  10, z1: -20, x2:  40, z2: -20, thickness: 0.5 }, // IE Lab 1 | IE Lab 2
          
          // Block U5
          { id: "F2_UP_U5_U6", type: "partition", x1:  65, z1: -35, x2:  65, z2: -5, thickness: 0.5 }, // U5 | U6 
          { id: "F2_UP_U5_HOD", type: "partition", x1:  40, z1: -25, x2:  48, z2: -25, thickness: 0.5 }, // HOD Cabin bottom
          { id: "F2_UP_U5_HOD_E", type: "partition", x1:  48, z1: -35, x2:  48, z2: -25, thickness: 0.5 }, // HOD Cabin right
          { id: "F2_UP_U5_DIV", type: "partition", x1:  40, z1: -20, x2:  65, z2: -20, thickness: 0.5 }, // IE Lab 3 | Professor's Faculty
          
          // Block U6
          { id: "F2_UP_U6_DIV", type: "partition", x1:  65, z1: -20, x2:  80, z2: -20, thickness: 0.5 }, // Classroom A1 | Classroom B1

          // =====================
          // 4. LOWER ROW: STRUCTURAL BLOCKS & ROOMS
          // =====================
          // Block L1
          { id: "F2_DN_L1_L2", type: "partition", x1: -40, z1:  5, x2: -40, z2:  35, thickness: 0.5 }, // L1 | L2
          { id: "F2_DN_L1_DIV1", type: "partition", x1: -80, z1:  15, x2: -40, z2:  15, thickness: 0.5 }, // Faculty for Assts | Tutorial 1
          { id: "F2_DN_L1_DIV2", type: "partition", x1: -80, z1:  25, x2: -40, z2:  25, thickness: 0.5 }, // Tutorial 1 | Tutorial 2
          
          // Block L2
          { id: "F2_DN_L2_L3", type: "partition", x1: -15, z1:  5, x2: -15, z2:  35, thickness: 0.5 }, // L2 | L3 (Core)
          { id: "F2_DN_L2_DIV", type: "partition", x1: -40, z1:  20, x2: -15, z2:  20, thickness: 0.5 }, // Elec Lab 3 | Elec Lab 4
          
          // Block L3
          { id: "F2_DN_L3_L4", type: "partition", x1:  15, z1:  5, x2:  15, z2:  35, thickness: 0.5 }, // L3 (Core) | L4
          { id: "F2_CORE_DIV", type: "partition", x1:  2, z1:  5, x2:  2, z2:  30, thickness: 0.5 }, // Main Stairs | Lifts
          
          // Block L4
          { id: "F2_DN_L4_L5", type: "partition", x1:  45, z1:  5, x2:  45, z2:  35, thickness: 0.5 }, // L4 | L5
          { id: "F2_DN_L4_DIV", type: "partition", x1:  15, z1:  20, x2:  45, z2:  20, thickness: 0.5 }, // DE Lab 1 | DE Lab 2
          
          // Block L5
          { id: "F2_DN_L5_L6", type: "partition", x1:  65, z1:  5, x2:  65, z2:  35, thickness: 0.5 }, // L5 | L6
          { id: "F2_DN_L5_AHU", type: "partition", x1:  50, z1:  5, x2:  50, z2:  35, thickness: 0.5 }, // AHU Room | DE Lab 3
          
          // Block L6
          { id: "F2_DN_L6_DIV", type: "partition", x1:  65, z1:  20, x2:  80, z2:  20, thickness: 0.5 }  // Classroom B2 | Classroom A
        ],
        doors: [
          // Essential doors (corridor access)
          { id: "F2_D_U1", wallId: "F2_CORR_N", x: -65.0, z: -5, width: 3 },
          { id: "F2_D_U2", wallId: "F2_CORR_N", x: -35.0, z: -5, width: 3 },
          { id: "F2_D_U3", wallId: "F2_CORR_N", x:  -5.0, z: -5, width: 3 },
          { id: "F2_D_U4", wallId: "F2_CORR_N", x:  25.0, z: -5, width: 3 },
          { id: "F2_D_U5", wallId: "F2_CORR_N", x:  50.0, z: -5, width: 3 },
          { id: "F2_D_U6", wallId: "F2_CORR_N", x:  72.0, z: -5, width: 3 },
          { id: "F2_D_L1", wallId: "F2_CORR_S", x: -60.0, z: 5, width: 3 },
          { id: "F2_D_L2", wallId: "F2_CORR_S", x: -27.5, z: 5, width: 3 },
          { id: "F2_D_STAIR", wallId: "F2_CORR_S", x: -6.5, z: 5, width: 4 },
          { id: "F2_D_LIFTS", wallId: "F2_CORR_S", x:  8.5, z: 5, width: 4 },
          { id: "F2_D_L4", wallId: "F2_CORR_S", x:  30.0, z: 5, width: 3 },
          { id: "F2_D_L5", wallId: "F2_CORR_S", x:  55.0, z: 5, width: 3 },
          { id: "F2_D_L6", wallId: "F2_CORR_S", x:  72.5, z: 5, width: 3 },
          
          // INNER PARTITION GAPS (FROM ARROWS)
          // North Row Inner Gaps
          { id: "F2_D_U1_DIV", wallId: "F2_UP_U1_DIV", x: -65.0, z: -20, width: 2 },
          { id: "F2_D_U2_DIV", wallId: "F2_UP_U2_DIV", x: -35.0, z: -20, width: 2 },
          { id: "F2_D_U3_TOILET1", wallId: "F2_UP_U3_TOILET1", x: -2.0, z: -16, width: 2 },
          { id: "F2_D_U4_DIV", wallId: "F2_UP_U4_DIV", x: 25.0, z: -20, width: 2 },
          { id: "F2_D_U5_HOD_E", wallId: "F2_UP_U5_HOD_E", x: 48.0, z: -30, width: 2 },
          { id: "F2_D_U6_DIV", wallId: "F2_UP_U6_DIV", x: 72.5, z: -20, width: 2 },
          
          // South Row Inner Gaps
          { id: "F2_D_L1_DIV1", wallId: "F2_DN_L1_DIV1", x: -60.0, z: 15, width: 2 },
          { id: "F2_D_L1_DIV2", wallId: "F2_DN_L1_DIV2", x: -60.0, z: 25, width: 2 },
          { id: "F2_D_L2_DIV", wallId: "F2_DN_L2_DIV", x: -27.5, z: 20, width: 2 },
          { id: "F2_D_L4_DIV", wallId: "F2_DN_L4_DIV", x: 30.0, z: 20, width: 2 },
          { id: "F2_D_L5_AHU", wallId: "F2_DN_L5_AHU", x: 50.0, z: 20, width: 2 },
          { id: "F2_D_L6_DIV", wallId: "F2_DN_L6_DIV", x: 72.5, z: 20, width: 2 },
          
          // VERTICAL PARTITION GAPS (FROM LATEST ARROWS)
          { id: "F2_D_U2_U3", wallId: "F2_UP_U2_U3", x: -20.0, z: -16, width: 2 },
          { id: "F2_D_U3_AHU", wallId: "F2_UP_U3_AHU", x: -12.0, z: -16, width: 2 },
          { id: "F2_D_U4_U5", wallId: "F2_UP_U4_U5", x: 40.0, z: -25, width: 2 },
          
          // FINAL TOILET CORE GAP (FROM ARROW)
          { id: "F2_D_U3_TOILET2", wallId: "F2_UP_U3_TOILET2", x: 4.0, z: -16, width: 2 }
        ],
        windows: [],
        stairs: [
          // 1. Main central staircase (L3)
          { id: "F2_STAIRS_MAIN", x: -6.5, z: 20.0, width: 12, depth: 16 }, 
          // 2. West Wing staircase 
          { id: "F2_STAIRS_WEST", x: -45.0, z: 0.0, width: 8, depth: 8 }, 
          // 3. East Wing staircase 
          { id: "F2_STAIRS_EAST", x:  65.0, z: 0.0, width: 8, depth: 8 }
        ],
        lifts: [
          // Four lifts in L3
          { id: "F2_LIFT_1", x:  6.0, z: 12.0, width: 4, depth: 4 },
          { id: "F2_LIFT_2", x:  6.0, z: 20.0, width: 4, depth: 4 },
          { id: "F2_LIFT_3", x: 11.0, z: 12.0, width: 4, depth: 4 },
          { id: "F2_LIFT_4", x: 11.0, z: 20.0, width: 4, depth: 4 }
        ],
        columns: []
      },
      nodes: [
          null,
          {
                    "id": "F2_D_U1_NODE",
                    "type": "door",
                    "name": "F2 D U1",
                    "x": -65,
                    "z": -5
          },
          {
                    "id": "F2_D_U2_NODE",
                    "type": "door",
                    "name": "F2 D U2",
                    "x": -35,
                    "z": -5
          },
          {
                    "id": "F2_D_U3_NODE",
                    "type": "door",
                    "name": "F2 D U3",
                    "x": -5,
                    "z": -5
          },
          {
                    "id": "F2_D_U4_NODE",
                    "type": "door",
                    "name": "F2 D U4",
                    "x": 25,
                    "z": -5
          },
          {
                    "id": "F2_D_U5_NODE",
                    "type": "door",
                    "name": "F2 D U5",
                    "x": 50,
                    "z": -5
          },
          {
                    "id": "F2_D_U6_NODE",
                    "type": "door",
                    "name": "F2 D U6",
                    "x": 72,
                    "z": -5
          },
          {
                    "id": "F2_D_L1_NODE",
                    "type": "door",
                    "name": "F2 D L1",
                    "x": -60,
                    "z": 5
          },
          {
                    "id": "F2_D_L2_NODE",
                    "type": "door",
                    "name": "F2 D L2",
                    "x": -27.5,
                    "z": 5
          },
          {
                    "id": "F2_D_STAIR_NODE",
                    "type": "door",
                    "name": "F2 D STAIR",
                    "x": -6.5,
                    "z": 5
          },
          {
                    "id": "F2_D_LIFTS_NODE",
                    "type": "door",
                    "name": "F2 D LIFTS",
                    "x": 8.5,
                    "z": 5
          },
          {
                    "id": "F2_D_L4_NODE",
                    "type": "door",
                    "name": "F2 D L4",
                    "x": 30,
                    "z": 5
          },
          {
                    "id": "F2_D_L5_NODE",
                    "type": "door",
                    "name": "F2 D L5",
                    "x": 55,
                    "z": 5
          },
          {
                    "id": "F2_D_L6_NODE",
                    "type": "door",
                    "name": "F2 D L6",
                    "x": 72.5,
                    "z": 5
          },
          {
                    "id": "F2_D_U1_DIV_NODE",
                    "type": "door",
                    "name": "F2 D U1 DIV",
                    "x": -65,
                    "z": -20
          },
          {
                    "id": "F2_D_U2_DIV_NODE",
                    "type": "door",
                    "name": "F2 D U2 DIV",
                    "x": -35,
                    "z": -20
          },
          {
                    "id": "F2_D_U3_TOILET1_NODE",
                    "type": "door",
                    "name": "F2 D U3 TOILET1",
                    "x": -2,
                    "z": -16
          },
          {
                    "id": "F2_D_U4_DIV_NODE",
                    "type": "door",
                    "name": "F2 D U4 DIV",
                    "x": 25,
                    "z": -20
          },
          {
                    "id": "F2_D_U5_HOD_E_NODE",
                    "type": "door",
                    "name": "F2 D U5 HOD E",
                    "x": 48,
                    "z": -30
          },
          {
                    "id": "F2_D_U6_DIV_NODE",
                    "type": "door",
                    "name": "F2 D U6 DIV",
                    "x": 72.5,
                    "z": -20
          },
          {
                    "id": "F2_D_L1_DIV1_NODE",
                    "type": "door",
                    "name": "F2 D L1 DIV1",
                    "x": -60,
                    "z": 15
          },
          {
                    "id": "F2_D_L1_DIV2_NODE",
                    "type": "door",
                    "name": "F2 D L1 DIV2",
                    "x": -60,
                    "z": 25
          },
          {
                    "id": "F2_D_L2_DIV_NODE",
                    "type": "door",
                    "name": "F2 D L2 DIV",
                    "x": -27.5,
                    "z": 20
          },
          {
                    "id": "F2_D_L4_DIV_NODE",
                    "type": "door",
                    "name": "F2 D L4 DIV",
                    "x": 30,
                    "z": 20
          },
          {
                    "id": "F2_D_L5_AHU_NODE",
                    "type": "door",
                    "name": "F2 D L5 AHU",
                    "x": 50,
                    "z": 20
          },
          {
                    "id": "F2_D_L6_DIV_NODE",
                    "type": "door",
                    "name": "F2 D L6 DIV",
                    "x": 72.5,
                    "z": 20
          },
          {
                    "id": "F2_D_U2_U3_NODE",
                    "type": "door",
                    "name": "F2 D U2 U3",
                    "x": -20,
                    "z": -16
          },
          {
                    "id": "F2_D_U3_AHU_NODE",
                    "type": "door",
                    "name": "F2 D U3 AHU",
                    "x": -12,
                    "z": -16
          },
          {
                    "id": "F2_D_U4_U5_NODE",
                    "type": "door",
                    "name": "F2 D U4 U5",
                    "x": 40,
                    "z": -25
          },
          {
                    "id": "F2_D_U3_TOILET2_NODE",
                    "type": "door",
                    "name": "F2 D U3 TOILET2",
                    "x": 4,
                    "z": -16
          },
          {
                    "id": "F2_STAIRS_MAIN_NODE",
                    "type": "staircase",
                    "name": "F2 Main Stairs",
                    "x": -6.5,
                    "z": 18
          }
],
      m3Connections: [
          {
                    "from": "F2_D_U1_NODE",
                    "to": "F2_D_L1_NODE"
          },
          {
                    "from": "F2_D_U2_NODE",
                    "to": "F2_D_L2_NODE"
          },
          {
                    "from": "F2_D_U3_NODE",
                    "to": "F2_D_STAIR_NODE"
          },
          {
                    "from": "F2_D_U4_NODE",
                    "to": "F2_D_L4_NODE"
          },
          {
                    "from": "F2_D_U5_NODE",
                    "to": "F2_D_L5_NODE"
          },
          {
                    "from": "F2_D_U6_NODE",
                    "to": "F2_D_L6_NODE"
          },
          {
                    "from": "F2_D_L1_NODE",
                    "to": "F2_D_L1_DIV1_NODE"
          },
          {
                    "from": "F2_D_LIFTS_NODE",
                    "to": "F2_D_STAIR_NODE"
          },
          {
                    "from": "F2_D_U1_DIV_NODE",
                    "to": "F2_D_U1_NODE"
          },
          {
                    "from": "F2_D_U2_DIV_NODE",
                    "to": "F2_D_U2_NODE"
          },
          {
                    "from": "F2_D_U3_TOILET1_NODE",
                    "to": "F2_D_U3_TOILET2_NODE"
          },
          {
                    "from": "F2_D_U4_DIV_NODE",
                    "to": "F2_D_U4_NODE"
          },
          {
                    "from": "F2_D_U5_HOD_E_NODE",
                    "to": "F2_D_U4_U5_NODE"
          },
          {
                    "from": "F2_D_U6_DIV_NODE",
                    "to": "F2_D_U6_NODE"
          },
          {
                    "from": "F2_D_L1_DIV2_NODE",
                    "to": "F2_D_L1_DIV1_NODE"
          },
          {
                    "from": "F2_D_L2_DIV_NODE",
                    "to": "F2_D_L2_NODE"
          },
          {
                    "from": "F2_D_L4_DIV_NODE",
                    "to": "F2_D_L4_NODE"
          },
          {
                    "from": "F2_D_L5_AHU_NODE",
                    "to": "F2_D_L5_NODE"
          },
          {
                    "from": "F2_D_L6_DIV_NODE",
                    "to": "F2_D_L6_NODE"
          },
          {
                    "from": "F2_D_U2_U3_NODE",
                    "to": "F2_D_U3_AHU_NODE"
          }
],
    },
    {
      level: 3,
      name: "Third Floor",
      units: "meters",
      elevation: 20.0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
﻿          // ==========================================
          // 1. OUTER ENVELOPE
          // ==========================================
          { id: "F3_EXT_N_LEFT",      type: "exterior", x1: -80, z1: -35, x2: -20, z2: -35, thickness: 0.5 },
          { id: "F3_EXT_N_RECESS_W",  type: "exterior", x1: -20, z1: -35, x2: -20, z2: -28, thickness: 0.5 },
          { id: "F3_EXT_N_RECESS",    type: "exterior", x1: -20, z1: -28, x2:  10, z2: -28, thickness: 0.5 },
          { id: "F3_EXT_N_RECESS_E",  type: "exterior", x1:  10, z1: -28, x2:  10, z2: -35, thickness: 0.5 },
          { id: "F3_EXT_N_RIGHT",     type: "exterior", x1:  10, z1: -35, x2:  80, z2: -35, thickness: 0.5 },
          { id: "F3_EXT_S_WEST",      type: "exterior", x1: -80, z1:  35, x2: -15, z2:  35, thickness: 0.5 },
          { id: "F3_EXT_S_CORE_W",    type: "exterior", x1: -15, z1:  35, x2: -15, z2:  30, thickness: 0.5 },
          { id: "F3_EXT_S_CORE",      type: "exterior", x1: -15, z1:  30, x2:  12, z2:  30, thickness: 0.5 },
          { id: "F3_EXT_S_CORE_E",    type: "exterior", x1:  12, z1:  30, x2:  12, z2:  35, thickness: 0.5 },
          { id: "F3_EXT_S_EAST",      type: "exterior", x1:  12, z1:  35, x2:  80, z2:  35, thickness: 0.5 },
          { id: "F3_EXT_W",           type: "exterior", x1: -80, z1: -35, x2: -80, z2:  35, thickness: 0.5 },
          { id: "F3_EXT_E",           type: "exterior", x1:  80, z1: -35, x2:  80, z2:  35, thickness: 0.5 },

          // ==========================================
          // 2. CENTRAL CORRIDOR (z = -5 to z = 5)
          // ==========================================
          { id: "F3_CORR_N",          type: "partition", x1: -80, z1: -5, x2:  80, z2: -5, thickness: 0.5 },
          { id: "F3_CORR_S_WEST", type: "partition", x1: -80, z1: 5, x2: -15, z2: 5, thickness: 0.5 },
          { id: "F3_CORR_S_EAST", type: "partition", x1: 12, z1: 5, x2: 80, z2: 5, thickness: 0.5 },

          // ==========================================
          // 3. NORTH WING (z = -35 to -5)
          // ==========================================
          // Class 14, HOD, Faculty (Asso)
          { id: "F3_N_H1",            type: "partition", x1: -80, z1: -20, x2: -50, z2: -20, thickness: 0.5 },
          { id: "F3_N_V_BLOCK",       type: "partition", x1: -50, z1: -35, x2: -50, z2: -5, thickness: 0.5 },

          // Thermal / Power & Refrigeration Lab
          { id: "F3_N_V3",            type: "partition", x1: -20, z1: -35, x2: -20, z2: -5, thickness: 0.5 },
          { id: "F3_N_H2",            type: "partition", x1: -50, z1: -20, x2: -20, z2: -20, thickness: 0.5 },

          // Central Toilet & AHU Core
          { id: "F3_N_V4",            type: "partition", x1: -12, z1: -28, x2: -12, z2: -5, thickness: 0.5 },
          { id: "F3_N_V5",            type: "partition", x1: -4, z1: -28, x2: -4, z2: -5, thickness: 0.5 },
          { id: "F3_N_V6",            type: "partition", x1: 4, z1: -28, x2: 4, z2: -5, thickness: 0.5 },
          { id: "F3_N_V7",            type: "partition", x1: 10, z1: -35, x2: 10, z2: -5, thickness: 0.5 },
          
          // Env & Soil Lab
          { id: "F3_N_V8",            type: "partition", x1: 45, z1: -35, x2: 45, z2: -5, thickness: 0.5 },
          { id: "F3_N_H3",            type: "partition", x1: 10, z1: -20, x2: 45, z2: -20, thickness: 0.5 },

          // HOD, Class 16, Prof Faculty
          { id: "F3_N_V9",            type: "partition", x1: 52, z1: -35, x2: 52, z2: -20, thickness: 0.5 }, // HOD Cabin divider
          { id: "F3_N_V10",           type: "partition", x1: 65, z1: -35, x2: 65, z2: -5, thickness: 0.5 },
          { id: "F3_N_H4",            type: "partition", x1: 45, z1: -20, x2: 65, z2: -20, thickness: 0.5 }, // Prof Faculty divider

          // Moderation, Exam, Assessment
          { id: "F3_N_H6",            type: "partition", x1: 65, z1: -15, x2: 80, z2: -15, thickness: 0.5 },

          // ==========================================
          // 4. SOUTH WING (z = 5 to 35)
          // ==========================================
          // Faculty Asst 1, Class 15, Faculty Asst 2
          { id: "F3_S_H_BLOCK",       type: "partition", x1: -80, z1: 20, x2: -50, z2: 20, thickness: 0.5 },
          { id: "F3_S_V_BLOCK",       type: "partition", x1: -50, z1: 5, x2: -50, z2: 35, thickness: 0.5 },

          // CAD/CAM & MQC Lab
          { id: "F3_S_V4",            type: "partition", x1: -15, z1: 5, x2: -15, z2: 30, thickness: 0.5 },
          { id: "F3_S_H1",            type: "partition", x1: -50, z1: 20, x2: -15, z2: 20, thickness: 0.5 },

          // Faculty Block, Boys Common, AHU
          { id: "F3_S_V5",            type: "partition", x1: 12, z1: 5, x2: 12, z2: 30, thickness: 0.5 }, // Lift Lobby East wall
          { id: "F3_S_H2",            type: "partition", x1: 12, z1: 15, x2: 45, z2: 15, thickness: 0.5 }, // Faculty block south wall
          { id: "F3_S_V6",            type: "partition", x1: 30, z1: 15, x2: 30, z2: 35, thickness: 0.5 }, // Boys Common / AHU divider
          { id: "F3_S_V7",            type: "partition", x1: 45, z1: 5, x2: 45, z2: 35, thickness: 0.5 },

          // Class 17 & Drawing Hall
          { id: "F3_S_V8",            type: "partition", x1: 65, z1: 5, x2: 65, z2: 35, thickness: 0.5 }
        ],
        doors: [
          // NORTH CORRIDOR ACCESS (z = -5)
          { id: "F3_D_FAC_ASSO", wallId: "F3_CORR_N", x: -65, z: -5, width: 3 },
          { id: "F3_D_REF_LAB", wallId: "F3_CORR_N", x: -35, z: -5, width: 3 },
          { id: "F3_D_TOILET_AHU", wallId: "F3_CORR_N", x: -16, z: -5, width: 3 },
          { id: "F3_D_TOILET_BOYS", wallId: "F3_CORR_N", x: -8, z: -5, width: 3 },
          { id: "F3_D_TOILET_GIRLS", wallId: "F3_CORR_N", x: 0, z: -5, width: 3 },
          { id: "F3_D_TOILET_HC", wallId: "F3_CORR_N", x: 7, z: -5, width: 3 },
          { id: "F3_D_SOIL_LAB", wallId: "F3_CORR_N", x: 27.5, z: -5, width: 3 },
          { id: "F3_D_PROF_FACULTY", wallId: "F3_CORR_N", x: 55, z: -5, width: 3 },
          { id: "F3_D_ASSESSMENT", wallId: "F3_CORR_N", x: 72.5, z: -5, width: 3 },

          // NORTH INNER PARTITIONS
          { id: "F3_D_N_H1_1", wallId: "F3_N_H1", x: -70, z: -20, width: 2 },
          { id: "F3_D_N_H1_2", wallId: "F3_N_H1", x: -55, z: -20, width: 2 },
          { id: "F3_D_N_H2", wallId: "F3_N_H2", x: -35, z: -20, width: 2 },
          { id: "F3_D_N_H3", wallId: "F3_N_H3", x: 27.5, z: -20, width: 2 },
          { id: "F3_D_N_H4_1", wallId: "F3_N_H4", x: 48.5, z: -20, width: 2 },
          { id: "F3_D_N_H4_2", wallId: "F3_N_H4", x: 58.5, z: -20, width: 2 },
          { id: "F3_D_N_H6", wallId: "F3_N_H6", x: 72.5, z: -15, width: 2 },

          // SOUTH CORRIDOR ACCESS (z = 5)
          { id: "F3_D_FAC_ASST_1", wallId: "F3_CORR_S_WEST", x: -65, z: 5, width: 3 },
          { id: "F3_D_CAD_CAM", wallId: "F3_CORR_S_WEST", x: -32.5, z: 5, width: 3 },
          { id: "F3_D_FAC_BLOCK", wallId: "F3_CORR_S_EAST", x: 28.5, z: 5, width: 3 },
          { id: "F3_D_CLASS_17", wallId: "F3_CORR_S_EAST", x: 55, z: 5, width: 3 },
          { id: "F3_D_DRAWING", wallId: "F3_CORR_S_EAST", x: 72.5, z: 5, width: 3 },

          // SOUTH INNER PARTITIONS
          { id: "F3_D_S_H_BLOCK_1", wallId: "F3_S_H_BLOCK", x: -70, z: 20, width: 2 },
          { id: "F3_D_S_H_BLOCK_2", wallId: "F3_S_H_BLOCK", x: -55, z: 20, width: 2 },
          { id: "F3_D_S_H1", wallId: "F3_S_H1", x: -32.5, z: 20, width: 2 },
          { id: "F3_D_S_H2_1", wallId: "F3_S_H2", x: 21, z: 15, width: 2 },
          { id: "F3_D_S_H2_2", wallId: "F3_S_H2", x: 37.5, z: 15, width: 2 }
        ],
        windows: [],
        stairs: [
          { id: "F3_STAIRS_MAIN", x: -6.5, z: 18.0, width: 12, depth: 18 },
          { id: "F3_STAIRS_WEST", x: -45.0, z: 0.0, width: 8, depth: 8 },
          { id: "F3_STAIRS_EAST", x: 65.0, z: 0.0, width: 8, depth: 8 }
        ],
        lifts: [
          { id: "F3_LIFT_1", x: 6.0, z: 9.0, width: 4, depth: 4 },
          { id: "F3_LIFT_2", x: 6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F3_LIFT_3", x: 10.5, z: 9.0, width: 4, depth: 4 },
          { id: "F3_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
        columns: []
      },
      nodes: [
﻿          { id: "F3_CLASSROOM_14", type: "room", name: "Classroom-14", x: -70, z: -27.5 },
          { id: "F3_HOD_1", type: "room", name: "H.O.D Cabin", x: -55, z: -27.5 },
          { id: "F3_FACULTY_ASSO", type: "room", name: "Faculty Room (Asso Prof)", x: -65, z: -12.5 },
          { id: "F3_THERMAL_LAB", type: "room", name: "Thermal / Power Lab", x: -35, z: -27.5 },
          { id: "F3_REF_LAB", type: "room", name: "Refrigeration Lab", x: -35, z: -12.5 },
          { id: "F3_AHU_ROOM_N", type: "room", name: "AHU Room", x: -16, z: -16.5 },
          { id: "F3_BOYS_TOILET", type: "room", name: "Boys Toilet", x: -8, z: -16.5 },
          { id: "F3_GIRLS_TOILET", type: "room", name: "Girls Toilet", x: 0, z: -16.5 },
          { id: "F3_HANDICAP_TOILET", type: "room", name: "Water Cooler / Handicap Toilet", x: 7, z: -16.5 },
          { id: "F3_ENV_LAB", type: "room", name: "Environmental Lab", x: 27.5, z: -27.5 },
          { id: "F3_SOIL_LAB", type: "room", name: "Soil Lab", x: 27.5, z: -12.5 },
          { id: "F3_HOD_2", type: "room", name: "H.O.D Cabin", x: 48.5, z: -27.5 },
          { id: "F3_CLASSROOM_16", type: "room", name: "Classroom-16", x: 58.5, z: -27.5 },
          { id: "F3_PROF_FACULTY", type: "room", name: "Professor's Faculty", x: 55, z: -12.5 },
          { id: "F3_MODERATION", type: "room", name: "Moderation Room", x: 72.5, z: -30 },
          { id: "F3_EXAM", type: "room", name: "Examination Room", x: 72.5, z: -20 },
          { id: "F3_ASSESSMENT", type: "room", name: "Assessment Room", x: 72.5, z: -10 },
          
          { id: "F3_FACULTY_ASST_1", type: "room", name: "Faculty Room (Asst)", x: -65, z: 12.5 },
          { id: "F3_CLASSROOM_15", type: "room", name: "Classroom-15", x: -70, z: 27.5 },
          { id: "F3_FACULTY_ASST_2", type: "room", name: "Faculty Room (Asst)", x: -55, z: 27.5 },
          { id: "F3_CAD_CAM", type: "room", name: "CAD/CAM Lab", x: -32.5, z: 12.5 },
          { id: "F3_MQC_LAB", type: "room", name: "M.Q.C. Lab", x: -32.5, z: 27.5 },
          { id: "F3_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 17.5 },
          { id: "F3_FACULTY_BLOCK", type: "room", name: "Faculty Block", x: 28.5, z: 10 },
          { id: "F3_BOYS_COMMON", type: "room", name: "Boy's Common Room", x: 21, z: 25 },
          { id: "F3_AHU_ROOM_S", type: "room", name: "AHU Room", x: 37.5, z: 25 },
          { id: "F3_CLASSROOM_17", type: "room", name: "Classroom-17", x: 55, z: 20 },
          { id: "F3_DRAWING_HALL", type: "room", name: "Drawing Hall-1", x: 72.5, z: 20 },
          
          // Corridors
          { id: "F3_CORRIDOR_WEST", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F3_CORRIDOR_CENTER", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          { id: "F3_CORRIDOR_EAST", type: "corridor", name: "East Corridor", x: 50, z: 0 },
          
          // Stairs
          { id: "F3_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F3_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          { id: "F3_STAIRS_EAST_NODE", type: "staircase", name: "East Stairs", x: 65, z: 0 },
          
          // Exits
          { id: "F3_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F3_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 },
          { id: "F3_EXIT_EAST", type: "exit", name: "East Egress", x: 58, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F3_D_FAC_ASSO_NODE", type: "door", name: "F3 D FAC ASSO", x: -65, z: -5 },
          { id: "F3_D_REF_LAB_NODE", type: "door", name: "F3 D REF LAB", x: -35, z: -5 },
          { id: "F3_D_TOILET_AHU_NODE", type: "door", name: "F3 D TOILET AHU", x: -16, z: -5 },
          { id: "F3_D_TOILET_BOYS_NODE", type: "door", name: "F3 D TOILET BOYS", x: -8, z: -5 },
          { id: "F3_D_TOILET_GIRLS_NODE", type: "door", name: "F3 D TOILET GIRLS", x: 0, z: -5 },
          { id: "F3_D_TOILET_HC_NODE", type: "door", name: "F3 D TOILET HC", x: 7, z: -5 },
          { id: "F3_D_SOIL_LAB_NODE", type: "door", name: "F3 D SOIL LAB", x: 27.5, z: -5 },
          { id: "F3_D_PROF_FACULTY_NODE", type: "door", name: "F3 D PROF FACULTY", x: 55, z: -5 },
          { id: "F3_D_ASSESSMENT_NODE", type: "door", name: "F3 D ASSESSMENT", x: 72.5, z: -5 },
          { id: "F3_D_N_H1_1_NODE", type: "door", name: "F3 D N H1 1", x: -70, z: -20 },
          { id: "F3_D_N_H1_2_NODE", type: "door", name: "F3 D N H1 2", x: -55, z: -20 },
          { id: "F3_D_N_H2_NODE", type: "door", name: "F3 D N H2", x: -35, z: -20 },
          { id: "F3_D_N_H3_NODE", type: "door", name: "F3 D N H3", x: 27.5, z: -20 },
          { id: "F3_D_N_H4_1_NODE", type: "door", name: "F3 D N H4 1", x: 48.5, z: -20 },
          { id: "F3_D_N_H4_2_NODE", type: "door", name: "F3 D N H4 2", x: 58.5, z: -20 },
          { id: "F3_D_N_H6_NODE", type: "door", name: "F3 D N H6", x: 72.5, z: -15 },
          { id: "F3_D_FAC_ASST_1_NODE", type: "door", name: "F3 D FAC ASST 1", x: -65, z: 5 },
          { id: "F3_D_CAD_CAM_NODE", type: "door", name: "F3 D CAD CAM", x: -32.5, z: 5 },
          { id: "F3_D_FAC_BLOCK_NODE", type: "door", name: "F3 D FAC BLOCK", x: 28.5, z: 5 },
          { id: "F3_D_CLASS_17_NODE", type: "door", name: "F3 D CLASS 17", x: 55, z: 5 },
          { id: "F3_D_DRAWING_NODE", type: "door", name: "F3 D DRAWING", x: 72.5, z: 5 },
          { id: "F3_D_S_H_BLOCK_1_NODE", type: "door", name: "F3 D S H BLOCK 1", x: -70, z: 20 },
          { id: "F3_D_S_H_BLOCK_2_NODE", type: "door", name: "F3 D S H BLOCK 2", x: -55, z: 20 },
          { id: "F3_D_S_H1_NODE", type: "door", name: "F3 D S H1", x: -32.5, z: 20 },
          { id: "F3_D_S_H2_1_NODE", type: "door", name: "F3 D S H2 1", x: 21, z: 15 },
          { id: "F3_D_S_H2_2_NODE", type: "door", name: "F3 D S H2 2", x: 37.5, z: 15 }
      ],
      m3Connections: [
          {
                    "from": "F3_FACULTY_ASSO",
                    "to": "F3_D_FAC_ASSO_NODE"
          },
          {
                    "from": "F3_D_FAC_ASSO_NODE",
                    "to": "F3_CORRIDOR_WEST"
          },
          {
                    "from": "F3_REF_LAB",
                    "to": "F3_D_REF_LAB_NODE"
          },
          {
                    "from": "F3_D_REF_LAB_NODE",
                    "to": "F3_CORRIDOR_WEST"
          },
          {
                    "from": "F3_AHU_ROOM_N",
                    "to": "F3_D_TOILET_AHU_NODE"
          },
          {
                    "from": "F3_D_TOILET_AHU_NODE",
                    "to": "F3_CORRIDOR_CENTER"
          },
          {
                    "from": "F3_BOYS_TOILET",
                    "to": "F3_D_TOILET_BOYS_NODE"
          },
          {
                    "from": "F3_D_TOILET_BOYS_NODE",
                    "to": "F3_CORRIDOR_CENTER"
          },
          {
                    "from": "F3_GIRLS_TOILET",
                    "to": "F3_D_TOILET_GIRLS_NODE"
          },
          {
                    "from": "F3_D_TOILET_GIRLS_NODE",
                    "to": "F3_CORRIDOR_CENTER"
          },
          {
                    "from": "F3_HANDICAP_TOILET",
                    "to": "F3_D_TOILET_HC_NODE"
          },
          {
                    "from": "F3_D_TOILET_HC_NODE",
                    "to": "F3_CORRIDOR_CENTER"
          },
          {
                    "from": "F3_SOIL_LAB",
                    "to": "F3_D_SOIL_LAB_NODE"
          },
          {
                    "from": "F3_D_SOIL_LAB_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_PROF_FACULTY",
                    "to": "F3_D_PROF_FACULTY_NODE"
          },
          {
                    "from": "F3_D_PROF_FACULTY_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_ASSESSMENT",
                    "to": "F3_D_ASSESSMENT_NODE"
          },
          {
                    "from": "F3_D_ASSESSMENT_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_CLASSROOM_14",
                    "to": "F3_D_N_H1_1_NODE"
          },
          {
                    "from": "F3_D_N_H1_1_NODE",
                    "to": "F3_FACULTY_ASSO"
          },
          {
                    "from": "F3_HOD_1",
                    "to": "F3_D_N_H1_2_NODE"
          },
          {
                    "from": "F3_D_N_H1_2_NODE",
                    "to": "F3_FACULTY_ASSO"
          },
          {
                    "from": "F3_THERMAL_LAB",
                    "to": "F3_D_N_H2_NODE"
          },
          {
                    "from": "F3_D_N_H2_NODE",
                    "to": "F3_REF_LAB"
          },
          {
                    "from": "F3_ENV_LAB",
                    "to": "F3_D_N_H3_NODE"
          },
          {
                    "from": "F3_D_N_H3_NODE",
                    "to": "F3_SOIL_LAB"
          },
          {
                    "from": "F3_HOD_2",
                    "to": "F3_D_N_H4_1_NODE"
          },
          {
                    "from": "F3_D_N_H4_1_NODE",
                    "to": "F3_PROF_FACULTY"
          },
          {
                    "from": "F3_CLASSROOM_16",
                    "to": "F3_D_N_H4_2_NODE"
          },
          {
                    "from": "F3_D_N_H4_2_NODE",
                    "to": "F3_PROF_FACULTY"
          },
          {
                    "from": "F3_EXAM",
                    "to": "F3_D_N_H6_NODE"
          },
          {
                    "from": "F3_D_N_H6_NODE",
                    "to": "F3_ASSESSMENT"
          },
          {
                    "from": "F3_FACULTY_ASST_1",
                    "to": "F3_D_FAC_ASST_1_NODE"
          },
          {
                    "from": "F3_D_FAC_ASST_1_NODE",
                    "to": "F3_CORRIDOR_WEST"
          },
          {
                    "from": "F3_CAD_CAM",
                    "to": "F3_D_CAD_CAM_NODE"
          },
          {
                    "from": "F3_D_CAD_CAM_NODE",
                    "to": "F3_CORRIDOR_WEST"
          },
          {
                    "from": "F3_FACULTY_BLOCK",
                    "to": "F3_D_FAC_BLOCK_NODE"
          },
          {
                    "from": "F3_D_FAC_BLOCK_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_STAIRS_EAST_NODE",
                    "to": "F3_D_CLASS_17_NODE"
          },
          {
                    "from": "F3_D_CLASS_17_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_STAIRS_EAST_NODE",
                    "to": "F3_D_DRAWING_NODE"
          },
          {
                    "from": "F3_D_DRAWING_NODE",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_CLASSROOM_15",
                    "to": "F3_D_S_H_BLOCK_1_NODE"
          },
          {
                    "from": "F3_D_S_H_BLOCK_1_NODE",
                    "to": "F3_FACULTY_ASST_1"
          },
          {
                    "from": "F3_FACULTY_ASST_2",
                    "to": "F3_D_S_H_BLOCK_2_NODE"
          },
          {
                    "from": "F3_D_S_H_BLOCK_2_NODE",
                    "to": "F3_FACULTY_ASST_1"
          },
          {
                    "from": "F3_CAD_CAM",
                    "to": "F3_D_S_H1_NODE"
          },
          {
                    "from": "F3_D_S_H1_NODE",
                    "to": "F3_MQC_LAB"
          },
          {
                    "from": "F3_FACULTY_BLOCK",
                    "to": "F3_D_S_H2_1_NODE"
          },
          {
                    "from": "F3_D_S_H2_1_NODE",
                    "to": "F3_BOYS_COMMON"
          },
          {
                    "from": "F3_AHU_ROOM_S",
                    "to": "F3_D_S_H2_2_NODE"
          },
          {
                    "from": "F3_D_S_H2_2_NODE",
                    "to": "F3_FACULTY_BLOCK"
          },
          {
                    "from": "F3_CORRIDOR_CENTER",
                    "to": "F3_EXIT_MAIN"
          },
          {
                    "from": "F3_STAIRS_WEST_NODE",
                    "to": "F3_EXIT_WEST"
          },
          {
                    "from": "F3_STAIRS_EAST_NODE",
                    "to": "F3_EXIT_EAST"
          },
          {
                    "from": "F3_CORRIDOR_WEST",
                    "to": "F3_CORRIDOR_CENTER"
          },
          {
                    "from": "F3_CORRIDOR_WEST",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_CORRIDOR_CENTER",
                    "to": "F3_CORRIDOR_EAST"
          },
          {
                    "from": "F3_MODERATION",
                    "to": "F3_D_N_H6_NODE"
          },
          {
                    "from": "F3_LIFT_LOBBY",
                    "to": "F3_D_TOILET_GIRLS_NODE"
          },
          {
                    "from": "F3_CLASSROOM_17",
                    "to": "F3_D_CLASS_17_NODE"
          },
          {
                    "from": "F3_DRAWING_HALL",
                    "to": "F3_D_DRAWING_NODE"
          },
          {
                    "from": "F3_CORRIDOR_CENTER",
                    "to": "F3_STAIRS_MAIN_NODE"
          },
          {
                    "from": "F3_D_N_H6_NODE",
                    "to": "F3_D_ASSESSMENT_NODE"
          }
],
    },
    {
      level: 4,
      name: "Fourth Floor",
      metadata: { source: "Official Fourth Floor Blueprint converted_page_4.png", verified: false },
      units: "meters",
      elevation: 25.0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
          // ==========================================
          // 1. OUTER ENVELOPE
          // ==========================================
          { id: "F4_EXT_N_LEFT",      type: "exterior", x1: -80, z1: -35, x2: -20, z2: -35, thickness: 0.5 },
          { id: "F4_EXT_N_RECESS_W",  type: "exterior", x1: -20, z1: -35, x2: -20, z2: -28, thickness: 0.5 },
          { id: "F4_EXT_N_RECESS",    type: "exterior", x1: -20, z1: -28, x2:  10, z2: -28, thickness: 0.5 },
          { id: "F4_EXT_N_RECESS_E",  type: "exterior", x1:  10, z1: -28, x2:  10, z2: -35, thickness: 0.5 },
          { id: "F4_EXT_N_RIGHT",     type: "exterior", x1:  10, z1: -35, x2:  80, z2: -35, thickness: 0.5 },
          { id: "F4_EXT_S_WEST",      type: "exterior", x1: -80, z1:  35, x2: -15, z2:  35, thickness: 0.5 },
          { id: "F4_EXT_S_CORE_W",    type: "exterior", x1: -15, z1:  35, x2: -15, z2:  30, thickness: 0.5 },
          { id: "F4_EXT_S_CORE",      type: "exterior", x1: -15, z1:  30, x2:  12, z2:  30, thickness: 0.5 },
          { id: "F4_EXT_S_CORE_E",    type: "exterior", x1:  12, z1:  30, x2:  12, z2:  35, thickness: 0.5 },
          { id: "F4_EXT_S_EAST",      type: "exterior", x1:  12, z1:  35, x2:  80, z2:  35, thickness: 0.5 },
          { id: "F4_EXT_W",           type: "exterior", x1: -80, z1: -35, x2: -80, z2:  35, thickness: 0.5 },
          { id: "F4_EXT_E",           type: "exterior", x1:  80, z1: -35, x2:  80, z2:  35, thickness: 0.5 },

          // ==========================================
          // 2. CENTRAL CORRIDOR (z = -5 to z = 5)
          // ==========================================
          { id: "F4_CORR_N",          type: "partition", x1: -80, z1: -5, x2:  80, z2: -5, thickness: 0.5 },
          { id: "F4_CORR_S_WEST", type: "partition", x1: -80, z1: 5, x2: -15, z2: 5, thickness: 0.5 },
          { id: "F4_CORR_S_EAST", type: "partition", x1: 12, z1: 5, x2: 80, z2: 5, thickness: 0.5 },

          // ==========================================
          // 3. NORTH WING (z = -35 to -5)
          // ==========================================
          // Class 14, HOD, Faculty (Asso)
          { id: "F4_N_H1",            type: "partition", x1: -80, z1: -20, x2: -50, z2: -20, thickness: 0.5 },
          { id: "F4_N_V_BLOCK",       type: "partition", x1: -50, z1: -35, x2: -50, z2: -5, thickness: 0.5 },

          // Thermal / Power & Refrigeration Lab
          { id: "F4_N_V3",            type: "partition", x1: -20, z1: -35, x2: -20, z2: -5, thickness: 0.5 },
          { id: "F4_N_H2",            type: "partition", x1: -50, z1: -20, x2: -20, z2: -20, thickness: 0.5 },

          // Central Toilet & AHU Core
          { id: "F4_N_V4",            type: "partition", x1: -12, z1: -28, x2: -12, z2: -5, thickness: 0.5 },
          { id: "F4_N_V5",            type: "partition", x1: -4, z1: -28, x2: -4, z2: -5, thickness: 0.5 },
          { id: "F4_N_V6",            type: "partition", x1: 4, z1: -28, x2: 4, z2: -5, thickness: 0.5 },
          { id: "F4_N_V7",            type: "partition", x1: 10, z1: -35, x2: 10, z2: -5, thickness: 0.5 },
          
          // Env & Soil Lab
          { id: "F4_N_V8",            type: "partition", x1: 45, z1: -35, x2: 45, z2: -5, thickness: 0.5 },
          { id: "F4_N_H3",            type: "partition", x1: 10, z1: -20, x2: 45, z2: -20, thickness: 0.5 },

          // HOD, Class 16, Prof Faculty
          { id: "F4_N_V9",            type: "partition", x1: 52, z1: -35, x2: 52, z2: -20, thickness: 0.5 }, // HOD Cabin divider
          { id: "F4_N_V10",           type: "partition", x1: 65, z1: -35, x2: 65, z2: -5, thickness: 0.5 },
          { id: "F4_N_H4",            type: "partition", x1: 45, z1: -20, x2: 65, z2: -20, thickness: 0.5 }, // Prof Faculty divider

          // Moderation, Exam, Assessment
          { id: "F4_N_H6",            type: "partition", x1: 65, z1: -15, x2: 80, z2: -15, thickness: 0.5 },

          // ==========================================
          // 4. SOUTH WING (z = 5 to 35)
          // ==========================================
          // Faculty Asst 1, Class 15, Faculty Asst 2
          { id: "F4_S_H_BLOCK",       type: "partition", x1: -80, z1: 20, x2: -50, z2: 20, thickness: 0.5 },
          { id: "F4_S_V_BLOCK",       type: "partition", x1: -50, z1: 5, x2: -50, z2: 35, thickness: 0.5 },

          // CAD/CAM & MQC Lab
          { id: "F4_S_V4",            type: "partition", x1: -15, z1: 5, x2: -15, z2: 30, thickness: 0.5 },
          { id: "F4_S_H1",            type: "partition", x1: -50, z1: 20, x2: -15, z2: 20, thickness: 0.5 },

          // Faculty Block, Boys Common, AHU
          { id: "F4_S_V5",            type: "partition", x1: 12, z1: 5, x2: 12, z2: 30, thickness: 0.5 }, // Lift Lobby East wall
          { id: "F4_S_H2",            type: "partition", x1: 12, z1: 15, x2: 45, z2: 15, thickness: 0.5 }, // Faculty block south wall
          { id: "F4_S_V6",            type: "partition", x1: 30, z1: 15, x2: 30, z2: 35, thickness: 0.5 }, // Boys Common / AHU divider
          { id: "F4_S_V7",            type: "partition", x1: 45, z1: 5, x2: 45, z2: 35, thickness: 0.5 },

          // Class 17 & Drawing Hall
          { id: "F4_S_V8",            type: "partition", x1: 65, z1: 5, x2: 65, z2: 35, thickness: 0.5 }
        ],
        doors: [
          // NORTH CORRIDOR ACCESS (z = -5)
          { id: "F4_D_FAC_ASSO", wallId: "F4_CORR_N", x: -65, z: -5, width: 3 },
          { id: "F4_D_REF_LAB", wallId: "F4_CORR_N", x: -35, z: -5, width: 3 },
          { id: "F4_D_TOILET_AHU", wallId: "F4_CORR_N", x: -16, z: -5, width: 3 },
          { id: "F4_D_TOILET_BOYS", wallId: "F4_CORR_N", x: -8, z: -5, width: 3 },
          { id: "F4_D_TOILET_GIRLS", wallId: "F4_CORR_N", x: 0, z: -5, width: 3 },
          { id: "F4_D_TOILET_HC", wallId: "F4_CORR_N", x: 7, z: -5, width: 3 },
          { id: "F4_D_SOIL_LAB", wallId: "F4_CORR_N", x: 27.5, z: -5, width: 3 },
          { id: "F4_D_PROF_FACULTY", wallId: "F4_CORR_N", x: 55, z: -5, width: 3 },
          { id: "F4_D_ASSESSMENT", wallId: "F4_CORR_N", x: 72.5, z: -5, width: 3 },

          // NORTH INNER PARTITIONS
          { id: "F4_D_N_H1_1", wallId: "F4_N_H1", x: -70, z: -20, width: 2 },
          { id: "F4_D_N_H1_2", wallId: "F4_N_H1", x: -55, z: -20, width: 2 },
          { id: "F4_D_N_H2", wallId: "F4_N_H2", x: -35, z: -20, width: 2 },
          { id: "F4_D_N_H3", wallId: "F4_N_H3", x: 27.5, z: -20, width: 2 },
          { id: "F4_D_N_H4_1", wallId: "F4_N_H4", x: 48.5, z: -20, width: 2 },
          { id: "F4_D_N_H4_2", wallId: "F4_N_H4", x: 58.5, z: -20, width: 2 },
          { id: "F4_D_N_H6", wallId: "F4_N_H6", x: 72.5, z: -15, width: 2 },

          // SOUTH CORRIDOR ACCESS (z = 5)
          { id: "F4_D_FAC_ASST_1", wallId: "F4_CORR_S_WEST", x: -65, z: 5, width: 3 },
          { id: "F4_D_CAD_CAM", wallId: "F4_CORR_S_WEST", x: -32.5, z: 5, width: 3 },
          { id: "F4_D_FAC_BLOCK", wallId: "F4_CORR_S_EAST", x: 28.5, z: 5, width: 3 },
          { id: "F4_D_CLASS_17", wallId: "F4_CORR_S_EAST", x: 55, z: 5, width: 3 },
          { id: "F4_D_DRAWING", wallId: "F4_CORR_S_EAST", x: 72.5, z: 5, width: 3 },

          // SOUTH INNER PARTITIONS
          { id: "F4_D_S_H_BLOCK_1", wallId: "F4_S_H_BLOCK", x: -70, z: 20, width: 2 },
          { id: "F4_D_S_H_BLOCK_2", wallId: "F4_S_H_BLOCK", x: -55, z: 20, width: 2 },
          { id: "F4_D_S_H1", wallId: "F4_S_H1", x: -32.5, z: 20, width: 2 },
          { id: "F4_D_S_H2_1", wallId: "F4_S_H2", x: 21, z: 15, width: 2 },
          { id: "F4_D_S_H2_2", wallId: "F4_S_H2", x: 37.5, z: 15, width: 2 }
        ],
        windows: [],
        stairs: [
          { id: "F4_STAIRS_MAIN", x: -6.5, z: 18.0, width: 12, depth: 18 },
          { id: "F4_STAIRS_WEST", x: -45.0, z: 0.0, width: 8, depth: 8 },
          { id: "F4_STAIRS_EAST", x: 65.0, z: 0.0, width: 8, depth: 8 }
        ],
        lifts: [
          { id: "F4_LIFT_1", x: 6.0, z: 9.0, width: 4, depth: 4 },
          { id: "F4_LIFT_2", x: 6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F4_LIFT_3", x: 10.5, z: 9.0, width: 4, depth: 4 },
          { id: "F4_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
        columns: []
      },
      nodes: [
﻿          { id: "F4_CLASSROOM_14", type: "room", name: "Classroom-14", x: -70, z: -27.5 },
          { id: "F4_HOD_1", type: "room", name: "H.O.D Cabin", x: -55, z: -27.5 },
          { id: "F4_FACULTY_ASSO", type: "room", name: "Faculty Room (Asso Prof)", x: -65, z: -12.5 },
          { id: "F4_THERMAL_LAB", type: "room", name: "Thermal / Power Lab", x: -35, z: -27.5 },
          { id: "F4_REF_LAB", type: "room", name: "Refrigeration Lab", x: -35, z: -12.5 },
          { id: "F4_AHU_ROOM_N", type: "room", name: "AHU Room", x: -16, z: -16.5 },
          { id: "F4_BOYS_TOILET", type: "room", name: "Boys Toilet", x: -8, z: -16.5 },
          { id: "F4_GIRLS_TOILET", type: "room", name: "Girls Toilet", x: 0, z: -16.5 },
          { id: "F4_HANDICAP_TOILET", type: "room", name: "Water Cooler / Handicap Toilet", x: 7, z: -16.5 },
          { id: "F4_ENV_LAB", type: "room", name: "Environmental Lab", x: 27.5, z: -27.5 },
          { id: "F4_SOIL_LAB", type: "room", name: "Soil Lab", x: 27.5, z: -12.5 },
          { id: "F4_HOD_2", type: "room", name: "H.O.D Cabin", x: 48.5, z: -27.5 },
          { id: "F4_CLASSROOM_16", type: "room", name: "Classroom-16", x: 58.5, z: -27.5 },
          { id: "F4_PROF_FACULTY", type: "room", name: "Professor's Faculty", x: 55, z: -12.5 },
          { id: "F4_MODERATION", type: "room", name: "Moderation Room", x: 72.5, z: -30 },
          { id: "F4_EXAM", type: "room", name: "Examination Room", x: 72.5, z: -20 },
          { id: "F4_ASSESSMENT", type: "room", name: "Assessment Room", x: 72.5, z: -10 },
          
          { id: "F4_FACULTY_ASST_1", type: "room", name: "Faculty Room (Asst)", x: -65, z: 12.5 },
          { id: "F4_CLASSROOM_15", type: "room", name: "Classroom-15", x: -70, z: 27.5 },
          { id: "F4_FACULTY_ASST_2", type: "room", name: "Faculty Room (Asst)", x: -55, z: 27.5 },
          { id: "F4_CAD_CAM", type: "room", name: "CAD/CAM Lab", x: -32.5, z: 12.5 },
          { id: "F4_MQC_LAB", type: "room", name: "M.Q.C. Lab", x: -32.5, z: 27.5 },
          { id: "F4_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 17.5 },
          { id: "F4_FACULTY_BLOCK", type: "room", name: "Faculty Block", x: 28.5, z: 10 },
          { id: "F4_BOYS_COMMON", type: "room", name: "Boy's Common Room", x: 21, z: 25 },
          { id: "F4_AHU_ROOM_S", type: "room", name: "AHU Room", x: 37.5, z: 25 },
          { id: "F4_CLASSROOM_17", type: "room", name: "Classroom-17", x: 55, z: 20 },
          { id: "F4_DRAWING_HALL", type: "room", name: "Drawing Hall-1", x: 72.5, z: 20 },
          
          // Corridors
          { id: "F4_CORRIDOR_WEST", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F4_CORRIDOR_CENTER", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          { id: "F4_CORRIDOR_EAST", type: "corridor", name: "East Corridor", x: 50, z: 0 },
          
          // Stairs
          { id: "F4_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F4_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          { id: "F4_STAIRS_EAST_NODE", type: "staircase", name: "East Stairs", x: 65, z: 0 },
          
          // Exits
          { id: "F4_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F4_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 },
          { id: "F4_EXIT_EAST", type: "exit", name: "East Egress", x: 58, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F4_D_FAC_ASSO_NODE", type: "door", name: "F4 D FAC ASSO", x: -65, z: -5 },
          { id: "F4_D_REF_LAB_NODE", type: "door", name: "F4 D REF LAB", x: -35, z: -5 },
          { id: "F4_D_TOILET_AHU_NODE", type: "door", name: "F4 D TOILET AHU", x: -16, z: -5 },
          { id: "F4_D_TOILET_BOYS_NODE", type: "door", name: "F4 D TOILET BOYS", x: -8, z: -5 },
          { id: "F4_D_TOILET_GIRLS_NODE", type: "door", name: "F4 D TOILET GIRLS", x: 0, z: -5 },
          { id: "F4_D_TOILET_HC_NODE", type: "door", name: "F4 D TOILET HC", x: 7, z: -5 },
          { id: "F4_D_SOIL_LAB_NODE", type: "door", name: "F4 D SOIL LAB", x: 27.5, z: -5 },
          { id: "F4_D_PROF_FACULTY_NODE", type: "door", name: "F4 D PROF FACULTY", x: 55, z: -5 },
          { id: "F4_D_ASSESSMENT_NODE", type: "door", name: "F4 D ASSESSMENT", x: 72.5, z: -5 },
          { id: "F4_D_N_H1_1_NODE", type: "door", name: "F4 D N H1 1", x: -70, z: -20 },
          { id: "F4_D_N_H1_2_NODE", type: "door", name: "F4 D N H1 2", x: -55, z: -20 },
          { id: "F4_D_N_H2_NODE", type: "door", name: "F4 D N H2", x: -35, z: -20 },
          { id: "F4_D_N_H3_NODE", type: "door", name: "F4 D N H3", x: 27.5, z: -20 },
          { id: "F4_D_N_H4_1_NODE", type: "door", name: "F4 D N H4 1", x: 48.5, z: -20 },
          { id: "F4_D_N_H4_2_NODE", type: "door", name: "F4 D N H4 2", x: 58.5, z: -20 },
          { id: "F4_D_N_H6_NODE", type: "door", name: "F4 D N H6", x: 72.5, z: -15 },
          { id: "F4_D_FAC_ASST_1_NODE", type: "door", name: "F4 D FAC ASST 1", x: -65, z: 5 },
          { id: "F4_D_CAD_CAM_NODE", type: "door", name: "F4 D CAD CAM", x: -32.5, z: 5 },
          { id: "F4_D_FAC_BLOCK_NODE", type: "door", name: "F4 D FAC BLOCK", x: 28.5, z: 5 },
          { id: "F4_D_CLASS_17_NODE", type: "door", name: "F4 D CLASS 17", x: 55, z: 5 },
          { id: "F4_D_DRAWING_NODE", type: "door", name: "F4 D DRAWING", x: 72.5, z: 5 },
          { id: "F4_D_S_H_BLOCK_1_NODE", type: "door", name: "F4 D S H BLOCK 1", x: -70, z: 20 },
          { id: "F4_D_S_H_BLOCK_2_NODE", type: "door", name: "F4 D S H BLOCK 2", x: -55, z: 20 },
          { id: "F4_D_S_H1_NODE", type: "door", name: "F4 D S H1", x: -32.5, z: 20 },
          { id: "F4_D_S_H2_1_NODE", type: "door", name: "F4 D S H2 1", x: 21, z: 15 },
          { id: "F4_D_S_H2_2_NODE", type: "door", name: "F4 D S H2 2", x: 37.5, z: 15 }
      ],
      m3Connections: [
          {
                    "from": "F4_FACULTY_ASSO",
                    "to": "F4_D_FAC_ASSO_NODE"
          },
          {
                    "from": "F4_D_FAC_ASSO_NODE",
                    "to": "F4_CORRIDOR_WEST"
          },
          {
                    "from": "F4_REF_LAB",
                    "to": "F4_D_REF_LAB_NODE"
          },
          {
                    "from": "F4_D_REF_LAB_NODE",
                    "to": "F4_CORRIDOR_WEST"
          },
          {
                    "from": "F4_AHU_ROOM_N",
                    "to": "F4_D_TOILET_AHU_NODE"
          },
          {
                    "from": "F4_D_TOILET_AHU_NODE",
                    "to": "F4_CORRIDOR_CENTER"
          },
          {
                    "from": "F4_BOYS_TOILET",
                    "to": "F4_D_TOILET_BOYS_NODE"
          },
          {
                    "from": "F4_D_TOILET_BOYS_NODE",
                    "to": "F4_CORRIDOR_CENTER"
          },
          {
                    "from": "F4_GIRLS_TOILET",
                    "to": "F4_D_TOILET_GIRLS_NODE"
          },
          {
                    "from": "F4_D_TOILET_GIRLS_NODE",
                    "to": "F4_CORRIDOR_CENTER"
          },
          {
                    "from": "F4_HANDICAP_TOILET",
                    "to": "F4_D_TOILET_HC_NODE"
          },
          {
                    "from": "F4_D_TOILET_HC_NODE",
                    "to": "F4_CORRIDOR_CENTER"
          },
          {
                    "from": "F4_SOIL_LAB",
                    "to": "F4_D_SOIL_LAB_NODE"
          },
          {
                    "from": "F4_D_SOIL_LAB_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_PROF_FACULTY",
                    "to": "F4_D_PROF_FACULTY_NODE"
          },
          {
                    "from": "F4_D_PROF_FACULTY_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_ASSESSMENT",
                    "to": "F4_D_ASSESSMENT_NODE"
          },
          {
                    "from": "F4_D_ASSESSMENT_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_CLASSROOM_14",
                    "to": "F4_D_N_H1_1_NODE"
          },
          {
                    "from": "F4_D_N_H1_1_NODE",
                    "to": "F4_FACULTY_ASSO"
          },
          {
                    "from": "F4_HOD_1",
                    "to": "F4_D_N_H1_2_NODE"
          },
          {
                    "from": "F4_D_N_H1_2_NODE",
                    "to": "F4_FACULTY_ASSO"
          },
          {
                    "from": "F4_THERMAL_LAB",
                    "to": "F4_D_N_H2_NODE"
          },
          {
                    "from": "F4_D_N_H2_NODE",
                    "to": "F4_REF_LAB"
          },
          {
                    "from": "F4_ENV_LAB",
                    "to": "F4_D_N_H3_NODE"
          },
          {
                    "from": "F4_D_N_H3_NODE",
                    "to": "F4_SOIL_LAB"
          },
          {
                    "from": "F4_HOD_2",
                    "to": "F4_D_N_H4_1_NODE"
          },
          {
                    "from": "F4_D_N_H4_1_NODE",
                    "to": "F4_PROF_FACULTY"
          },
          {
                    "from": "F4_CLASSROOM_16",
                    "to": "F4_D_N_H4_2_NODE"
          },
          {
                    "from": "F4_D_N_H4_2_NODE",
                    "to": "F4_PROF_FACULTY"
          },
          {
                    "from": "F4_EXAM",
                    "to": "F4_D_N_H6_NODE"
          },
          {
                    "from": "F4_D_N_H6_NODE",
                    "to": "F4_ASSESSMENT"
          },
          {
                    "from": "F4_FACULTY_ASST_1",
                    "to": "F4_D_FAC_ASST_1_NODE"
          },
          {
                    "from": "F4_D_FAC_ASST_1_NODE",
                    "to": "F4_CORRIDOR_WEST"
          },
          {
                    "from": "F4_CAD_CAM",
                    "to": "F4_D_CAD_CAM_NODE"
          },
          {
                    "from": "F4_D_CAD_CAM_NODE",
                    "to": "F4_CORRIDOR_WEST"
          },
          {
                    "from": "F4_FACULTY_BLOCK",
                    "to": "F4_D_FAC_BLOCK_NODE"
          },
          {
                    "from": "F4_D_FAC_BLOCK_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_STAIRS_EAST_NODE",
                    "to": "F4_D_CLASS_17_NODE"
          },
          {
                    "from": "F4_D_CLASS_17_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_STAIRS_EAST_NODE",
                    "to": "F4_D_DRAWING_NODE"
          },
          {
                    "from": "F4_D_DRAWING_NODE",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_CLASSROOM_15",
                    "to": "F4_D_S_H_BLOCK_1_NODE"
          },
          {
                    "from": "F4_D_S_H_BLOCK_1_NODE",
                    "to": "F4_FACULTY_ASST_1"
          },
          {
                    "from": "F4_FACULTY_ASST_2",
                    "to": "F4_D_S_H_BLOCK_2_NODE"
          },
          {
                    "from": "F4_D_S_H_BLOCK_2_NODE",
                    "to": "F4_FACULTY_ASST_1"
          },
          {
                    "from": "F4_CAD_CAM",
                    "to": "F4_D_S_H1_NODE"
          },
          {
                    "from": "F4_D_S_H1_NODE",
                    "to": "F4_MQC_LAB"
          },
          {
                    "from": "F4_FACULTY_BLOCK",
                    "to": "F4_D_S_H2_1_NODE"
          },
          {
                    "from": "F4_D_S_H2_1_NODE",
                    "to": "F4_BOYS_COMMON"
          },
          {
                    "from": "F4_AHU_ROOM_S",
                    "to": "F4_D_S_H2_2_NODE"
          },
          {
                    "from": "F4_D_S_H2_2_NODE",
                    "to": "F4_FACULTY_BLOCK"
          },
          {
                    "from": "F4_CORRIDOR_CENTER",
                    "to": "F4_EXIT_MAIN"
          },
          {
                    "from": "F4_STAIRS_WEST_NODE",
                    "to": "F4_EXIT_WEST"
          },
          {
                    "from": "F4_STAIRS_EAST_NODE",
                    "to": "F4_EXIT_EAST"
          },
          {
                    "from": "F4_CORRIDOR_WEST",
                    "to": "F4_CORRIDOR_CENTER"
          },
          {
                    "from": "F4_CORRIDOR_WEST",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_CORRIDOR_CENTER",
                    "to": "F4_CORRIDOR_EAST"
          },
          {
                    "from": "F4_MODERATION",
                    "to": "F4_D_N_H6_NODE"
          },
          {
                    "from": "F4_LIFT_LOBBY",
                    "to": "F4_D_TOILET_GIRLS_NODE"
          },
          {
                    "from": "F4_CLASSROOM_17",
                    "to": "F4_D_CLASS_17_NODE"
          },
          {
                    "from": "F4_DRAWING_HALL",
                    "to": "F4_D_DRAWING_NODE"
          },
          {
                    "from": "F4_CORRIDOR_CENTER",
                    "to": "F4_STAIRS_MAIN_NODE"
          },
          {
                    "from": "F4_D_N_H6_NODE",
                    "to": "F4_D_ASSESSMENT_NODE"
          }
],
    }    ,
    // ============================================================
    // LEVEL 5 — FIFTH FLOOR
    // Source: converted_page_5.png
    // ============================================================
    {
      level: 5,
      name: "Fifth Floor",
      metadata: { source: "Official Fifth Floor Blueprint converted_page_5.png", verified: false },
      units: "meters",
      elevation: 30.0,
      wallHeight: 5.0,
      wallHeightVerified: false,
      geometry: {
        walls: [
          // ==========================================
          // 1. OUTER ENVELOPE (Based on Level 5 Blueprint)
          // ==========================================
          // LEFT WING (Labs 1-6 block)
          { id: "F5_EXT_LW_N",   type: "exterior", x1: -90, z1: -35, x2: -35, z2: -35, thickness: 0.5 },
          { id: "F5_EXT_LW_W",   type: "exterior", x1: -90, z1: -35, x2: -90, z2:  35, thickness: 0.5 },
          { id: "F5_EXT_LW_S",   type: "exterior", x1: -90, z1:  35, x2: -35, z2:  35, thickness: 0.5 },
          { id: "F5_EXT_LW_E_N", type: "exterior", x1: -35, z1: -35, x2: -35, z2:  -5, thickness: 0.5 },
          { id: "F5_EXT_LW_E_S", type: "exterior", x1: -35, z1:   5, x2: -35, z2:  35, thickness: 0.5 },

          // WEST COURTYARD CORRIDOR LINK
          { id: "F5_EXT_C_W_N",  type: "exterior", x1: -35, z1: -5,  x2: -15, z2: -5,  thickness: 0.5 },
          { id: "F5_EXT_C_W_S",  type: "exterior", x1: -35, z1:  5,  x2: -15, z2:  5,  thickness: 0.5 },

          // CENTER BLOCK (North Toilet/AHU Core)
          { id: "F5_EXT_NCORE_W",type: "exterior", x1: -15, z1: -5,  x2: -15, z2: -28, thickness: 0.5 },
          { id: "F5_EXT_NCORE_N",type: "exterior", x1: -15, z1: -28, x2:  10, z2: -28, thickness: 0.5 },
          { id: "F5_EXT_NCORE_E",type: "exterior", x1:  10, z1: -28, x2:  10, z2: -5,  thickness: 0.5 },

          // CENTER BLOCK (South Lift Core + Seminar Hall)
          { id: "F5_EXT_SCORE_W",type: "exterior", x1: -15, z1:   5, x2: -15, z2:  30, thickness: 0.5 },
          { id: "F5_EXT_SCORE_S",type: "exterior", x1: -15, z1:  30, x2:  12, z2:  30, thickness: 0.5 },
          { id: "F5_EXT_SEM_W",  type: "exterior", x1:  12, z1:  30, x2:  12, z2:  52, thickness: 0.5 },
          { id: "F5_EXT_SEM_S",  type: "exterior", x1:  12, z1:  52, x2:  62, z2:  52, thickness: 0.5 },
          { id: "F5_EXT_SEM_E",  type: "exterior", x1:  62, z1:  52, x2:  62, z2:   5, thickness: 0.5 },

          // EAST COURTYARD CORRIDOR LINKS
          { id: "F5_EXT_C_E_N",  type: "exterior", x1:  10, z1: -5,  x2:  30, z2: -5,  thickness: 0.5 },
          { id: "F5_EXT_C_E_S",  type: "exterior", x1:  62, z1:  5,  x2:  65, z2:  5,  thickness: 0.5 },

          // RIGHT WING (Faculty & Library)
          { id: "F5_EXT_RW_N_W", type: "exterior", x1:  30, z1: -5,  x2:  30, z2: -35, thickness: 0.5 },
          { id: "F5_EXT_RW_N_N", type: "exterior", x1:  30, z1: -35, x2: 110, z2: -35, thickness: 0.5 },
          { id: "F5_EXT_RW_N_E", type: "exterior", x1: 110, z1: -35, x2: 110, z2: -5,  thickness: 0.5 },
          
          { id: "F5_EXT_RW_S_W", type: "exterior", x1:  65, z1:   5, x2:  65, z2:  35, thickness: 0.5 },
          { id: "F5_EXT_RW_S_S", type: "exterior", x1:  65, z1:  35, x2: 110, z2:  35, thickness: 0.5 },
          { id: "F5_EXT_RW_S_E", type: "exterior", x1: 110, z1:  35, x2: 110, z2:   5, thickness: 0.5 },

          // ==========================================
          // 2. CENTRAL CORRIDOR (Inside Blocks Only)
          // ==========================================
          { id: "F5_CORR_N_LW",  type: "partition", x1: -90, z1: -5, x2: -35, z2: -5, thickness: 0.5 },
          { id: "F5_CORR_S_LW",  type: "partition", x1: -90, z1:  5, x2: -35, z2:  5, thickness: 0.5 },
          { id: "F5_CORR_N_NC",  type: "partition", x1: -15, z1: -5, x2:  10, z2: -5, thickness: 0.5 },
          { id: "F5_CORR_S_SC",  type: "partition", x1: -15, z1:  5, x2:  62, z2:  5, thickness: 0.5 },
          { id: "F5_CORR_N_RW",  type: "partition", x1:  30, z1: -5, x2: 110, z2: -5, thickness: 0.5 },
          { id: "F5_CORR_S_RW",  type: "partition", x1:  65, z1:  5, x2: 110, z2:  5, thickness: 0.5 },

          // ==========================================
          // 3. WEST WING (LEFT SIDE)
          // ==========================================
          // North-West (Lab-6, Fac-Asso, Lab-1, Lab-2)
          { id: "F5_NW_H1", type: "partition", x1: -90, z1: -18, x2: -60, z2: -18, thickness: 0.5 }, // Lab-6 | Fac Asso
          { id: "F5_NW_V1", type: "partition", x1: -60, z1: -35, x2: -60, z2: -5,  thickness: 0.5 }, // Outer | Inner Labs
          { id: "F5_NW_H2", type: "partition", x1: -60, z1: -18, x2: -35, z2: -18, thickness: 0.5 }, // Lab-1 | Lab-2
          
          // South-West (Fac-Asst, Lab-5, Lab-3, Lab-4)
          { id: "F5_SW_H1", type: "partition", x1: -90, z1:  18, x2: -60, z2:  18, thickness: 0.5 }, // Fac Asst | Lab-5
          { id: "F5_SW_V1", type: "partition", x1: -60, z1:   5, x2: -60, z2:  35, thickness: 0.5 }, // Outer | Inner Labs
          { id: "F5_SW_H2", type: "partition", x1: -60, z1:  18, x2: -35, z2:  18, thickness: 0.5 }, // Lab-3 | Lab-4

          // ==========================================
          // 4. CENTRAL CORES
          // ==========================================
          // North Toilet/AHU Core (x=-15 to 10)
          { id: "F5_NCORE_V1", type: "partition", x1:  -6, z1: -28, x2:  -6, z2: -5, thickness: 0.5 }, // AHU | Boys
          { id: "F5_NCORE_V2", type: "partition", x1:   0, z1: -28, x2:   0, z2: -5, thickness: 0.5 }, // Boys | Girls
          { id: "F5_NCORE_V3", type: "partition", x1:   5, z1: -28, x2:   5, z2: -5, thickness: 0.5 }, // Girls | Water/Handicap
          { id: "F5_NCORE_H1", type: "partition", x1:   5, z1: -16, x2:  10, z2: -16, thickness: 0.5 },// Water | Handicap divider
          
          // South Lift/Stair Core & Seminar Hall
          { id: "F5_SCORE_V1", type: "partition", x1:  12, z1:   5, x2:  12, z2:  30, thickness: 0.5 }, // Core | Seminar Hall
          { id: "F5_SCORE_H1", type: "partition", x1: -15, z1:  20, x2:  12, z2:  20, thickness: 0.5 }, // Lift Lobby | Stairs

          // Lifts enclosures
          { id: "F5_LIFT_SHAFT_W", type: "partition", x1:   5, z1:   5, x2:   5, z2:  20, thickness: 0.5 },
          { id: "F5_LIFT_SHAFT_DIV", type: "partition", x1: 8.5, z1:   5, x2: 8.5, z2:  20, thickness: 0.5 },

          // ==========================================
          // 5. EAST WING (RIGHT SIDE)
          // ==========================================
          // North-East (Faculty Area, Library, Reading Rooms)
          { id: "F5_NE_V1", type: "partition", x1:  65, z1: -35, x2:  65, z2: -5, thickness: 0.5 }, // Faculty | Baggage
          { id: "F5_NE_V2", type: "partition", x1:  80, z1: -35, x2:  80, z2: -5, thickness: 0.5 }, // Baggage | Primary Reading Room

          // South-East (AHU, Storage, Sec Reading)
          { id: "F5_SE_V1", type: "partition", x1:  80, z1:   5, x2:  80, z2:  35, thickness: 0.5 }, // Librarian/AHU | Book Storage
          { id: "F5_SE_H1", type: "partition", x1:  65, z1:  18, x2:  80, z2:  18, thickness: 0.5 }, // AHU | Librarian
          { id: "F5_SE_V2", type: "partition", x1:  95, z1:   5, x2:  95, z2:  35, thickness: 0.5 } // Book Storage | Sec Reading Room
        ],
        doors: [
          // NORTH LEFT WING (Labs)
          { id: "F5_D_LAB2", wallId: "F5_CORR_N_LW", x: -47.5, z: -5, width: 3 },
          { id: "F5_D_LAB1", wallId: "F5_CORR_N_LW", x: -75, z: -5, width: 3 },
          { id: "F5_D_FAC_ASSO", wallId: "F5_NW_H2", x: -47.5, z: -18, width: 2 },
          { id: "F5_D_LAB6", wallId: "F5_NW_H1", x: -75, z: -18, width: 2 },
          // SOUTH LEFT WING (Labs)
          { id: "F5_D_LAB5", wallId: "F5_CORR_S_LW", x: -47.5, z: 5, width: 3 },
          { id: "F5_D_FAC_ASST", wallId: "F5_CORR_S_LW", x: -75, z: 5, width: 3 },
          { id: "F5_D_LAB4", wallId: "F5_SW_H2", x: -47.5, z: 18, width: 2 },
          { id: "F5_D_LAB3", wallId: "F5_SW_H1", x: -75, z: 18, width: 2 },
          // CENTER CORE NORTH
          { id: "F5_D_AHU_N", wallId: "F5_CORR_N_NC", x: -10.5, z: -5, width: 2 },
          { id: "F5_D_BOYS", wallId: "F5_CORR_N_NC", x: -3, z: -5, width: 3 },
          { id: "F5_D_GIRLS", wallId: "F5_CORR_N_NC", x: 2.5, z: -5, width: 3 },
          { id: "F5_D_HANDICAP", wallId: "F5_CORR_N_NC", x: 7.5, z: -5, width: 2 },
          // CENTER CORE SOUTH
          { id: "F5_D_LIFT_LOBBY_CORR", wallId: "F5_CORR_S_SC", x: -6.5, z: 5, width: 4 },
          { id: "F5_D_SEMINAR", wallId: "F5_CORR_S_SC", x: 37, z: 5, width: 6 },
          // EAST WING NORTH
          { id: "F5_D_FACULTY", wallId: "F5_CORR_N_RW", x: 47.5, z: -5, width: 3 },
          { id: "F5_D_BAGGAGE", wallId: "F5_CORR_N_RW", x: 72.5, z: -5, width: 3 },
          { id: "F5_D_PRI_READ", wallId: "F5_CORR_N_RW", x: 95, z: -5, width: 4 },
          // EAST WING SOUTH
          { id: "F5_D_AHU_S", wallId: "F5_CORR_S_RW", x: 72.5, z: 5, width: 2 },
          { id: "F5_D_LIBRARIAN", wallId: "F5_SE_H1", x: 72.5, z: 18, width: 2 },
          { id: "F5_D_BOOK_STORAGE", wallId: "F5_CORR_S_RW", x: 87.5, z: 5, width: 3 },
          { id: "F5_D_SEC_READ", wallId: "F5_CORR_S_RW", x: 102.5, z: 5, width: 4 },
          // SCREENSHOT GAPS
          { id: "F5_D_WATER_HANDICAP", wallId: "F5_NCORE_H1", x: 7.5, z: -16, width: 2 },
          { id: "F5_D_LIFT_STAIRS", wallId: "F5_SCORE_H1", x: -1.5, z: 20, width: 3 },
          { id: "F5_D_STAIRS_SEM", wallId: "F5_SCORE_V1", x: 12, z: 25, width: 2 }
        ],
        windows: [],
        stairs: [
          { id: "F5_STAIRS_WEST", x: -45.0, z: 0.0, width: 8, depth: 8 },
          { id: "F5_STAIRS_MAIN", x: -6.5, z: 18.0, width: 12, depth: 18 },
          { id: "F5_STAIRS_EAST", x: 65.0, z: 0.0, width: 8, depth: 8 }
        ],
        lifts: [
          { id: "F5_LIFT_1", x: 6.0, z: 9.0, width: 4, depth: 4 },
          { id: "F5_LIFT_2", x: 6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F5_LIFT_3", x: 10.5, z: 9.0, width: 4, depth: 4 },
          { id: "F5_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
        columns: []
      },
      nodes: [
          // BLUE MARKERS - Rooms
          { id: "F5_LAB2", type: "room", name: "Lab-2", x: -47.5, z: -11.5 },
          { id: "F5_LAB1", type: "room", name: "Lab-1", x: -75, z: -11.5 },
          { id: "F5_FAC_ASSO", type: "room", name: "Faculty (Asso)", x: -47.5, z: -26.5 },
          { id: "F5_LAB6", type: "room", name: "Lab-6", x: -75, z: -26.5 },
          { id: "F5_LAB5", type: "room", name: "Lab-5", x: -47.5, z: 11.5 },
          { id: "F5_FAC_ASST", type: "room", name: "Faculty (Asst)", x: -75, z: 11.5 },
          { id: "F5_LAB4", type: "room", name: "Lab-4", x: -47.5, z: 26.5 },
          { id: "F5_LAB3", type: "room", name: "Lab-3", x: -75, z: 26.5 },
          { id: "F5_AHU_N", type: "room", name: "AHU Room", x: -10.5, z: -16.5 },
          { id: "F5_BOYS", type: "room", name: "Boys Toilet", x: -3, z: -16.5 },
          { id: "F5_GIRLS", type: "room", name: "Girls Toilet", x: 2.5, z: -16.5 },
          { id: "F5_HANDICAP", type: "room", name: "Handicap Toilet", x: 7.5, z: -10.5 },
          { id: "F5_SEMINAR", type: "room", name: "Seminar Hall", x: 37, z: 28 },
          { id: "F5_FACULTY", type: "room", name: "Faculty Area", x: 47.5, z: -20 },
          { id: "F5_BAGGAGE", type: "room", name: "Baggage", x: 72.5, z: -20 },
          { id: "F5_PRI_READ", type: "room", name: "Primary Reading Room", x: 95, z: -20 },
          { id: "F5_AHU_S", type: "room", name: "AHU Room", x: 72.5, z: 11.5 },
          { id: "F5_LIBRARIAN", type: "room", name: "Librarian", x: 72.5, z: 26.5 },
          { id: "F5_BOOK_STORAGE", type: "room", name: "Book Storage", x: 87.5, z: 20 },
          { id: "F5_SEC_READ", type: "room", name: "Secondary Reading Room", x: 102.5, z: 20 },
          { id: "F5_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 17.5 },
          // PURPLE MARKERS - Corridors
          { id: "F5_CORR_W", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F5_CORR_C", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          { id: "F5_CORR_E", type: "corridor", name: "East Corridor", x: 50, z: 0 },
          { id: "F5_CORR_EE", type: "corridor", name: "Far East Corridor", x: 80, z: 0 },
          // YELLOW MARKERS - Stairs
          { id: "F5_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F5_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          { id: "F5_STAIRS_EAST_NODE", type: "staircase", name: "East Stairs", x: 65, z: 0 },
          // GREEN MARKERS - Exits
          { id: "F5_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F5_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 },
          { id: "F5_EXIT_EAST", type: "exit", name: "East Egress", x: 58, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F5_D_LAB2_NODE", type: "door", name: "F5 D LAB2", x: -47.5, z: -5 },
          { id: "F5_D_LAB1_NODE", type: "door", name: "F5 D LAB1", x: -75, z: -5 },
          { id: "F5_D_FAC_ASSO_NODE", type: "door", name: "F5 D FAC ASSO", x: -47.5, z: -18 },
          { id: "F5_D_LAB6_NODE", type: "door", name: "F5 D LAB6", x: -75, z: -18 },
          { id: "F5_D_LAB5_NODE", type: "door", name: "F5 D LAB5", x: -47.5, z: 5 },
          { id: "F5_D_FAC_ASST_NODE", type: "door", name: "F5 D FAC ASST", x: -75, z: 5 },
          { id: "F5_D_LAB4_NODE", type: "door", name: "F5 D LAB4", x: -47.5, z: 18 },
          { id: "F5_D_LAB3_NODE", type: "door", name: "F5 D LAB3", x: -75, z: 18 },
          { id: "F5_D_AHU_N_NODE", type: "door", name: "F5 D AHU N", x: -10.5, z: -5 },
          { id: "F5_D_BOYS_NODE", type: "door", name: "F5 D BOYS", x: -3, z: -5 },
          { id: "F5_D_GIRLS_NODE", type: "door", name: "F5 D GIRLS", x: 2.5, z: -5 },
          { id: "F5_D_HANDICAP_NODE", type: "door", name: "F5 D HANDICAP", x: 7.5, z: -5 },
          { id: "F5_D_LIFT_LOBBY_CORR_NODE", type: "door", name: "F5 D LIFT LOBBY CORR", x: -6.5, z: 5 },
          { id: "F5_D_SEMINAR_NODE", type: "door", name: "F5 D SEMINAR", x: 37, z: 5 },
          { id: "F5_D_FACULTY_NODE", type: "door", name: "F5 D FACULTY", x: 47.5, z: -5 },
          { id: "F5_D_BAGGAGE_NODE", type: "door", name: "F5 D BAGGAGE", x: 72.5, z: -5 },
          { id: "F5_D_PRI_READ_NODE", type: "door", name: "F5 D PRI READ", x: 95, z: -5 },
          { id: "F5_D_AHU_S_NODE", type: "door", name: "F5 D AHU S", x: 72.5, z: 5 },
          { id: "F5_D_LIBRARIAN_NODE", type: "door", name: "F5 D LIBRARIAN", x: 72.5, z: 18 },
          { id: "F5_D_BOOK_STORAGE_NODE", type: "door", name: "F5 D BOOK STORAGE", x: 87.5, z: 5 },
          { id: "F5_D_SEC_READ_NODE", type: "door", name: "F5 D SEC READ", x: 102.5, z: 5 },
          { id: "F5_D_WATER_HANDICAP_NODE", type: "door", name: "F5 D WATER HANDICAP", x: 7.5, z: -16 },
          { id: "F5_D_LIFT_STAIRS_NODE", type: "door", name: "F5 D LIFT STAIRS", x: -1.5, z: 20 },
          { id: "F5_D_STAIRS_SEM_NODE", type: "door", name: "F5 D STAIRS SEM", x: 12, z: 25 }
      ],
      m3Connections: [
          {
                    "from": "F5_STAIRS_WEST_NODE",
                    "to": "F5_D_LAB2_NODE"
          },
          {
                    "from": "F5_D_LAB2_NODE",
                    "to": "F5_CORR_W"
          },
          {
                    "from": "F5_LAB1",
                    "to": "F5_D_LAB1_NODE"
          },
          {
                    "from": "F5_D_LAB1_NODE",
                    "to": "F5_CORR_W"
          },
          {
                    "from": "F5_LAB2",
                    "to": "F5_D_FAC_ASSO_NODE"
          },
          {
                    "from": "F5_D_FAC_ASSO_NODE",
                    "to": "F5_FAC_ASSO"
          },
          {
                    "from": "F5_LAB1",
                    "to": "F5_D_LAB6_NODE"
          },
          {
                    "from": "F5_D_LAB6_NODE",
                    "to": "F5_LAB6"
          },
          {
                    "from": "F5_STAIRS_WEST_NODE",
                    "to": "F5_D_LAB5_NODE"
          },
          {
                    "from": "F5_D_LAB5_NODE",
                    "to": "F5_CORR_W"
          },
          {
                    "from": "F5_FAC_ASST",
                    "to": "F5_D_FAC_ASST_NODE"
          },
          {
                    "from": "F5_D_FAC_ASST_NODE",
                    "to": "F5_CORR_W"
          },
          {
                    "from": "F5_LAB5",
                    "to": "F5_D_LAB4_NODE"
          },
          {
                    "from": "F5_D_LAB4_NODE",
                    "to": "F5_LAB4"
          },
          {
                    "from": "F5_FAC_ASST",
                    "to": "F5_D_LAB3_NODE"
          },
          {
                    "from": "F5_D_LAB3_NODE",
                    "to": "F5_LAB3"
          },
          {
                    "from": "F5_AHU_N",
                    "to": "F5_D_AHU_N_NODE"
          },
          {
                    "from": "F5_D_AHU_N_NODE",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_BOYS",
                    "to": "F5_D_BOYS_NODE"
          },
          {
                    "from": "F5_D_BOYS_NODE",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_GIRLS",
                    "to": "F5_D_GIRLS_NODE"
          },
          {
                    "from": "F5_D_GIRLS_NODE",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_HANDICAP",
                    "to": "F5_D_HANDICAP_NODE"
          },
          {
                    "from": "F5_D_HANDICAP_NODE",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_STAIRS_MAIN_NODE",
                    "to": "F5_D_LIFT_LOBBY_CORR_NODE"
          },
          {
                    "from": "F5_D_LIFT_LOBBY_CORR_NODE",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_SEMINAR",
                    "to": "F5_D_SEMINAR_NODE"
          },
          {
                    "from": "F5_D_SEMINAR_NODE",
                    "to": "F5_CORR_E"
          },
          {
                    "from": "F5_FACULTY",
                    "to": "F5_D_FACULTY_NODE"
          },
          {
                    "from": "F5_D_FACULTY_NODE",
                    "to": "F5_CORR_E"
          },
          {
                    "from": "F5_STAIRS_EAST_NODE",
                    "to": "F5_D_BAGGAGE_NODE"
          },
          {
                    "from": "F5_D_BAGGAGE_NODE",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_PRI_READ",
                    "to": "F5_D_PRI_READ_NODE"
          },
          {
                    "from": "F5_D_PRI_READ_NODE",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_AHU_S",
                    "to": "F5_D_AHU_S_NODE"
          },
          {
                    "from": "F5_D_AHU_S_NODE",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_AHU_S",
                    "to": "F5_D_LIBRARIAN_NODE"
          },
          {
                    "from": "F5_D_LIBRARIAN_NODE",
                    "to": "F5_LIBRARIAN"
          },
          {
                    "from": "F5_BOOK_STORAGE",
                    "to": "F5_D_BOOK_STORAGE_NODE"
          },
          {
                    "from": "F5_D_BOOK_STORAGE_NODE",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_SEC_READ",
                    "to": "F5_D_SEC_READ_NODE"
          },
          {
                    "from": "F5_D_SEC_READ_NODE",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_HANDICAP",
                    "to": "F5_D_WATER_HANDICAP_NODE"
          },
          {
                    "from": "F5_LIFT_LOBBY",
                    "to": "F5_D_LIFT_STAIRS_NODE"
          },
          {
                    "from": "F5_D_LIFT_STAIRS_NODE",
                    "to": "F5_STAIRS_MAIN_NODE"
          },
          {
                    "from": "F5_SEMINAR",
                    "to": "F5_D_STAIRS_SEM_NODE"
          },
          {
                    "from": "F5_STAIRS_MAIN_NODE",
                    "to": "F5_EXIT_MAIN"
          },
          {
                    "from": "F5_STAIRS_WEST_NODE",
                    "to": "F5_EXIT_WEST"
          },
          {
                    "from": "F5_STAIRS_EAST_NODE",
                    "to": "F5_EXIT_EAST"
          },
          {
                    "from": "F5_CORR_W",
                    "to": "F5_CORR_C"
          },
          {
                    "from": "F5_CORR_W",
                    "to": "F5_CORR_E"
          },
          {
                    "from": "F5_CORR_W",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_CORR_C",
                    "to": "F5_CORR_E"
          },
          {
                    "from": "F5_CORR_C",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_CORR_E",
                    "to": "F5_CORR_EE"
          },
          {
                    "from": "F5_BAGGAGE",
                    "to": "F5_D_BAGGAGE_NODE"
          }
],
    },

    {
      level: 6,
      name: "Sixth Floor",
      metadata: { source: "Official Sixth Floor Blueprint converted_page_6.png", verified: false },
      units: "meters",
      elevation: 35.0,
      wallHeight: 5.0,
      geometry: {
        walls: [
          // ==========================================
          // 1. OUTER ENVELOPE (Based on Level 6 Blueprint)
          // ==========================================
          // LEFT WING (Labs/Classrooms Block) Outer Envelope
          { id: "F6_EXT_LW_N",   type: "exterior", x1: -90, z1: -35, x2: -35, z2: -35, thickness: 0.5 },
          { id: "F6_EXT_LW_W",   type: "exterior", x1: -90, z1: -35, x2: -90, z2:  35, thickness: 0.5 },
          { id: "F6_EXT_LW_S",   type: "exterior", x1: -90, z1:  35, x2: -45, z2:  35, thickness: 0.5 }, // Bottom edge of C3 and C4
          // Stepped East boundary for the Lower Left block
          { id: "F6_EXT_LW_SE_V", type: "exterior", x1: -45, z1:  35, x2: -45, z2:  20, thickness: 0.5 }, // C4 East exterior
          { id: "F6_EXT_LW_SE_H", type: "exterior", x1: -45, z1:  20, x2: -35, z2:  20, thickness: 0.5 }, // Stair South exterior
          { id: "F6_EXT_LW_E_S",  type: "exterior", x1: -35, z1:  20, x2: -35, z2:   5, thickness: 0.5 }, // Stair East exterior
          // East boundary for the Upper Left block
          { id: "F6_EXT_LW_E_N",  type: "exterior", x1: -35, z1:  -5, x2: -35, z2: -35, thickness: 0.5 }, // C5 East exterior

          // WEST COURTYARD CORRIDOR LINK
          { id: "F6_EXT_C_W_N",  type: "exterior", x1: -35, z1: -5,  x2: -15, z2: -5,  thickness: 0.5 },
          { id: "F6_EXT_C_W_S",  type: "exterior", x1: -35, z1:  5,  x2: -15, z2:  5,  thickness: 0.5 },

          // CENTER-RIGHT MAIN MASS (Toilet Core + Lift Core + Massive Right Terrace)
          // North edge (Toilet Core and Terrace are flush)
          { id: "F6_EXT_MB_W_N", type: "exterior", x1: -15, z1: -5,  x2: -15, z2: -28, thickness: 0.5 },
          { id: "F6_EXT_MB_N",   type: "exterior", x1: -15, z1: -28, x2: 110, z2: -28, thickness: 0.5 },
          { id: "F6_EXT_MB_E",   type: "exterior", x1: 110, z1: -28, x2: 110, z2:  25, thickness: 0.5 },
          { id: "F6_EXT_MB_S_R", type: "exterior", x1: 110, z1:  25, x2:  12, z2:  25, thickness: 0.5 },
          { id: "F6_EXT_MB_STEP",type: "exterior", x1:  12, z1:  25, x2:  12, z2:  30, thickness: 0.5 }, // Step down to Lift Core
          { id: "F6_EXT_MB_S_L", type: "exterior", x1:  12, z1:  30, x2: -15, z2:  30, thickness: 0.5 },
          { id: "F6_EXT_MB_W_S", type: "exterior", x1: -15, z1:  30, x2: -15, z2:   5, thickness: 0.5 },

          // ==========================================
          // 2. MAJOR STRUCTURAL PARTITIONS
          // ==========================================
          // Central Corridor lines (inside blocks)
          { id: "F6_CORR_N_LW",  type: "partition", x1: -90, z1: -5, x2: -35, z2: -5, thickness: 0.5 },
          { id: "F6_CORR_S_LW",  type: "partition", x1: -90, z1:  5, x2: -35, z2:  5, thickness: 0.5 },
          // Left Wing Internal Classrooms Partitions
          { id: "F6_LW_P1", type: "partition", x1: -60, z1: -35, x2: -60, z2: -5, thickness: 0.5 }, // Divides C1 & C5
          { id: "F6_LW_P2", type: "partition", x1: -65, z1:   5, x2: -65, z2: 35, thickness: 0.5 }, // Divides C2/C3 & C4
          { id: "F6_LW_P3", type: "partition", x1: -90, z1:  20, x2: -65, z2: 20, thickness: 0.5 }, // Divides C2 & C3
          { id: "F6_LW_P4", type: "partition", x1: -45, z1:   5, x2: -45, z2: 20, thickness: 0.5 }, // Divides C4 & Stair Core
          { id: "F6_LW_P5", type: "partition", x1: -39, z1:   5, x2: -39, z2: 20, thickness: 0.5 }, // Internal Stair Core shaft divider
          { id: "F6_CORR_N_NC",  type: "partition", x1: -15, z1: -5, x2:  10, z2: -5, thickness: 0.5 },
          { id: "F6_CORR_S_SC",  type: "partition", x1: -15, z1:  5, x2:  12, z2:  5, thickness: 0.5 }, // Corridor ends at right terrace

          // North Toilet/AHU Core structural boundary
          { id: "F6_NCORE_V4", type: "partition", x1:  10, z1: -28, x2:  10, z2: -5, thickness: 0.5 }, // Toilet Core | Open Terrace

          // South Lift/Stair Core structural boundary
          { id: "F6_SCORE_V1", type: "partition", x1:  12, z1:   5, x2:  12, z2:  25, thickness: 0.5 }, // Lift Core | Open Terrace
          { id: "F6_SCORE_H1", type: "partition", x1: -15, z1:  20, x2:  12, z2:  20, thickness: 0.5 }, // Lift Lobby | Stairs

          // Lifts enclosures (Must match below floors)
          { id: "F6_LIFT_SHAFT_W", type: "partition", x1:   5, z1:   5, x2:   5, z2:  20, thickness: 0.5 },
          { id: "F6_LIFT_SHAFT_DIV", type: "partition", x1: 8.5, z1:   5, x2: 8.5, z2:  20, thickness: 0.5 }
        ],
        ﻿                doors: [
          // LEFT WING NORTH
          { id: "F6_D_C1", wallId: "F6_CORR_N_LW", x: -75, z: -5, width: 3 },
          { id: "F6_D_C5", wallId: "F6_CORR_N_LW", x: -47.5, z: -5, width: 3 },
          // LEFT WING SOUTH
          { id: "F6_D_C2", wallId: "F6_CORR_S_LW", x: -77.5, z: 5, width: 3 },
          { id: "F6_D_C4", wallId: "F6_CORR_S_LW", x: -55, z: 5, width: 3 },
          { id: "F6_D_STAIRS_WEST", wallId: "F6_CORR_S_LW", x: -40, z: 5, width: 4 },
          { id: "F6_D_C3", wallId: "F6_LW_P3", x: -77.5, z: 20, width: 2 }, // C3 to C2
          // CENTER CORE
          { id: "F6_D_TOILET", wallId: "F6_CORR_N_NC", x: -2.5, z: -5, width: 4 },
          { id: "F6_D_LIFT_LOBBY", wallId: "F6_CORR_S_SC", x: -6.5, z: 5, width: 4 },
          { id: "F6_D_STAIRS", wallId: "F6_SCORE_H1", x: -1.5, z: 20, width: 3 },
          // TERRACE ACCESS
          { id: "F6_D_TERRACE_N", wallId: "F6_NCORE_V4", x: 10, z: -15, width: 3 },
          { id: "F6_D_TERRACE_S", wallId: "F6_SCORE_V1", x: 12, z: 15, width: 3 }
        ],
        windows: [],
        stairs: [
          { id: "F6_STAIRS_WEST", x: -42.0, z: 12.5, width: 6, depth: 15 },
          { id: "F6_STAIRS_MAIN", x: -6.5, z: 18.0, width: 12, depth: 18 }
        ],
        lifts: [
          { id: "F6_LIFT_1", x: 6.0, z: 9.0, width: 4, depth: 4 },
          { id: "F6_LIFT_2", x: 6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F6_LIFT_3", x: 10.5, z: 9.0, width: 4, depth: 4 },
          { id: "F6_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
        ﻿                columns: [
          // Adding a few placeholder structural columns on the right terrace to match the 3x3 grid
          { id: "F6_COL_1", x: 40, z: -20, radius: 0.8 },
          { id: "F6_COL_2", x: 75, z: -20, radius: 0.8 },
          { id: "F6_COL_3", x: 105, z: -20, radius: 0.8 },
          { id: "F6_COL_4", x: 40, z: 0, radius: 0.8 },
          { id: "F6_COL_5", x: 75, z: 0, radius: 0.8 },
          { id: "F6_COL_6", x: 105, z: 0, radius: 0.8 },
          { id: "F6_COL_7", x: 40, z: 20, radius: 0.8 },
          { id: "F6_COL_8", x: 75, z: 20, radius: 0.8 },
          { id: "F6_COL_9", x: 105, z: 20, radius: 0.8 }
        ]
      },
      nodes: [
          // BLUE MARKERS - Rooms
          { id: "F6_C1", type: "room", name: "Classroom C1", x: -75, z: -20 },
          { id: "F6_C5", type: "room", name: "Classroom C5", x: -47.5, z: -20 },
          { id: "F6_C2", type: "room", name: "Classroom C2", x: -77.5, z: 12.5 },
          { id: "F6_C3", type: "room", name: "Classroom C3", x: -77.5, z: 27.5 },
          { id: "F6_C4", type: "room", name: "Classroom C4", x: -55, z: 20 },
          { id: "F6_TOILET_CORE", type: "room", name: "Toilet/AHU Core", x: -2.5, z: -16.5 },
          { id: "F6_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 12.5 },
          { id: "F6_TERRACE", type: "room", name: "Open Terrace", x: 60, z: 0 },
          // PURPLE MARKERS - Corridors
          { id: "F6_CORR_W", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F6_CORR_C", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          // YELLOW MARKERS - Stairs
          { id: "F6_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F6_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          // GREEN MARKERS - Exits
          { id: "F6_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F6_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F6_D_C1_NODE", type: "door", name: "F6 D C1", x: -75, z: -5 },
          { id: "F6_D_C5_NODE", type: "door", name: "F6 D C5", x: -47.5, z: -5 },
          { id: "F6_D_C2_NODE", type: "door", name: "F6 D C2", x: -77.5, z: 5 },
          { id: "F6_D_C4_NODE", type: "door", name: "F6 D C4", x: -55, z: 5 },
          { id: "F6_D_STAIRS_WEST_NODE", type: "door", name: "F6 D STAIRS WEST", x: -40, z: 5 },
          { id: "F6_D_C3_NODE", type: "door", name: "F6 D C3", x: -77.5, z: 20 },
          { id: "F6_D_TOILET_NODE", type: "door", name: "F6 D TOILET", x: -2.5, z: -5 },
          { id: "F6_D_LIFT_LOBBY_NODE", type: "door", name: "F6 D LIFT LOBBY", x: -6.5, z: 5 },
          { id: "F6_D_STAIRS_NODE", type: "door", name: "F6 D STAIRS", x: -1.5, z: 20 },
          { id: "F6_D_TERRACE_N_NODE", type: "door", name: "F6 D TERRACE N", x: 10, z: -15 },
          { id: "F6_D_TERRACE_S_NODE", type: "door", name: "F6 D TERRACE S", x: 12, z: 15 }
      ],
      m3Connections: [
          {
                    "from": "F6_C1",
                    "to": "F6_D_C1_NODE"
          },
          {
                    "from": "F6_D_C1_NODE",
                    "to": "F6_CORR_W"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F6_D_C5_NODE"
          },
          {
                    "from": "F6_D_C5_NODE",
                    "to": "F6_CORR_W"
          },
          {
                    "from": "F6_C2",
                    "to": "F6_D_C2_NODE"
          },
          {
                    "from": "F6_D_C2_NODE",
                    "to": "F6_CORR_W"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F6_D_C4_NODE"
          },
          {
                    "from": "F6_D_C4_NODE",
                    "to": "F6_CORR_W"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F6_D_STAIRS_WEST_NODE"
          },
          {
                    "from": "F6_D_STAIRS_WEST_NODE",
                    "to": "F6_CORR_W"
          },
          {
                    "from": "F6_C2",
                    "to": "F6_D_C3_NODE"
          },
          {
                    "from": "F6_D_C3_NODE",
                    "to": "F6_C3"
          },
          {
                    "from": "F6_TOILET_CORE",
                    "to": "F6_D_TOILET_NODE"
          },
          {
                    "from": "F6_D_TOILET_NODE",
                    "to": "F6_CORR_C"
          },
          {
                    "from": "F6_LIFT_LOBBY",
                    "to": "F6_D_LIFT_LOBBY_NODE"
          },
          {
                    "from": "F6_D_LIFT_LOBBY_NODE",
                    "to": "F6_CORR_C"
          },
          {
                    "from": "F6_STAIRS_MAIN_NODE",
                    "to": "F6_D_STAIRS_NODE"
          },
          {
                    "from": "F6_D_STAIRS_NODE",
                    "to": "F6_LIFT_LOBBY"
          },
          {
                    "from": "F6_TOILET_CORE",
                    "to": "F6_D_TERRACE_N_NODE"
          },
          {
                    "from": "F6_D_TERRACE_N_NODE",
                    "to": "F6_TERRACE"
          },
          {
                    "from": "F6_TERRACE",
                    "to": "F6_D_TERRACE_S_NODE"
          },
          {
                    "from": "F6_STAIRS_MAIN_NODE",
                    "to": "F6_EXIT_MAIN"
          },
          {
                    "from": "F6_STAIRS_WEST_NODE",
                    "to": "F6_EXIT_WEST"
          },
          {
                    "from": "F6_CORR_W",
                    "to": "F6_CORR_C"
          },
          {
                    "from": "F6_C5",
                    "to": "F6_D_C5_NODE"
          },
          {
                    "from": "F6_C4",
                    "to": "F6_D_C4_NODE"
          }
],
    },

    {
      level: 7,
      name: "Seventh Floor",
      metadata: { source: "Official Seventh Floor Blueprint converted_page_7.png", verified: false },
      units: "meters",
      elevation: 40.0,
      wallHeight: 5.0,
      geometry: {
        walls: [
          // ==========================================
          // 1. OUTER ENVELOPE (Based on Level 7 Blueprint)
          // ==========================================
          // LEFT WING (Classrooms 6-10)
          { id: "F7_EXT_LW_N",   type: "exterior", x1: -90, z1: -35, x2: -35, z2: -35, thickness: 0.5 },
          { id: "F7_EXT_LW_W",   type: "exterior", x1: -90, z1: -35, x2: -90, z2:  35, thickness: 0.5 },
          { id: "F7_EXT_LW_S",   type: "exterior", x1: -90, z1:  35, x2: -45, z2:  35, thickness: 0.5 },
          { id: "F7_EXT_LW_SE_V", type: "exterior", x1: -45, z1:  35, x2: -45, z2:  20, thickness: 0.5 },
          { id: "F7_EXT_LW_SE_H", type: "exterior", x1: -45, z1:  20, x2: -35, z2:  20, thickness: 0.5 },
          { id: "F7_EXT_LW_E_S",  type: "exterior", x1: -35, z1:  20, x2: -35, z2:   5, thickness: 0.5 },
          { id: "F7_EXT_LW_E_N",  type: "exterior", x1: -35, z1:  -5, x2: -35, z2: -35, thickness: 0.5 },

          // WEST COURTYARD CORRIDOR LINK
          { id: "F7_EXT_C_W_N",  type: "exterior", x1: -35, z1: -5,  x2: -15, z2: -5,  thickness: 0.5 },
          { id: "F7_EXT_C_W_S",  type: "exterior", x1: -35, z1:  5,  x2: -15, z2:  5,  thickness: 0.5 },

          // CENTER-RIGHT MAIN MASS (Toilet Core + Lift Core + Enclosed Classrooms 11-17)
          // North edge (Toilet Core and North Classrooms are flush)
          { id: "F7_EXT_MB_W_N", type: "exterior", x1: -15, z1: -5,  x2: -15, z2: -28, thickness: 0.5 },
          { id: "F7_EXT_MB_N",   type: "exterior", x1: -15, z1: -28, x2: 110, z2: -28, thickness: 0.5 },
          // East edge (Classrooms 14 and 15)
          { id: "F7_EXT_MB_E",   type: "exterior", x1: 110, z1: -28, x2: 110, z2:  25, thickness: 0.5 },
          // South-East Block (Classrooms 16 & 15) South edge
          { id: "F7_EXT_MB_SE_S",type: "exterior", x1: 110, z1:  25, x2:  60, z2:  25, thickness: 0.5 },
          // South-East Block West edge (facing the gap)
          { id: "F7_EXT_MB_SE_W",type: "exterior", x1:  60, z1:  25, x2:  60, z2:   5, thickness: 0.5 },
          // Gap Corridor South edge
          { id: "F7_EXT_MB_GAP_S",type: "exterior", x1: 60, z1:   5, x2:  35, z2:   5, thickness: 0.5 },
          // Classroom 17 East edge (facing the gap)
          { id: "F7_EXT_MB_C17_E",type: "exterior", x1: 35, z1:   5, x2:  35, z2:  30, thickness: 0.5 },
          // Classroom 17 and Lift Core South edge
          { id: "F7_EXT_MB_S",   type: "exterior", x1:  35, z1:  30, x2: -15, z2:  30, thickness: 0.5 },
          // West edge of Lift Core
          { id: "F7_EXT_MB_W_S", type: "exterior", x1: -15, z1:  30, x2: -15, z2:   5, thickness: 0.5 },

          // ==========================================
          // 2. MAJOR STRUCTURAL PARTITIONS
          // ==========================================
          // Central Corridor lines (inside blocks)
          { id: "F7_CORR_N_LW",  type: "partition", x1: -90, z1: -5, x2: -35, z2: -5, thickness: 0.5 },
          { id: "F7_CORR_S_LW",  type: "partition", x1: -90, z1:  5, x2: -35, z2:  5, thickness: 0.5 },
          { id: "F7_CORR_N_NC",  type: "partition", x1: -15, z1: -5, x2: 110, z2: -5, thickness: 0.5 },
          { id: "F7_CORR_S_SC",  type: "partition", x1: -15, z1:  5, x2: 110, z2:  5, thickness: 0.5 },
          // Left Wing Internal Partitions
          { id: "F7_LW_P1", type: "partition", x1: -60, z1: -35, x2: -60, z2: -5, thickness: 0.5 }, // Divides C6 & C10
          { id: "F7_LW_P2", type: "partition", x1: -65, z1:   5, x2: -65, z2: 35, thickness: 0.5 }, // Divides C7/C8 & C9
          { id: "F7_LW_P3", type: "partition", x1: -90, z1:  20, x2: -65, z2: 20, thickness: 0.5 }, // Divides C7 & C8
          { id: "F7_LW_P4", type: "partition", x1: -45, z1:   5, x2: -45, z2: 20, thickness: 0.5 }, // Divides C9 & Stair Core
          { id: "F7_LW_P5", type: "partition", x1: -39, z1:   5, x2: -39, z2: 20, thickness: 0.5 }, // Internal Stair Core shaft divider
          // East Wing Internal Partitions
          { id: "F7_MB_P1", type: "partition", x1:  35, z1: -28, x2:  35, z2: -5, thickness: 0.5 }, // Divides C11 & C12
          { id: "F7_MB_P2", type: "partition", x1:  60, z1: -28, x2:  60, z2: -5, thickness: 0.5 }, // Divides C12 & C13
          { id: "F7_MB_P3", type: "partition", x1:  85, z1: -28, x2:  85, z2: -5, thickness: 0.5 }, // Divides C13 & C14
          { id: "F7_MB_P4", type: "partition", x1:  85, z1:   5, x2:  85, z2: 25, thickness: 0.5 }, // Divides C16 & C15
          { id: "F7_MB_P5", type: "partition", x1:  85, z1:  -5, x2:  85, z2:  5, thickness: 0.5 }, // Corridor blocker for Conference Room

          // North Toilet/AHU Core structural boundary
          { id: "F7_NCORE_V4", type: "partition", x1:  10, z1: -28, x2:  10, z2: -5, thickness: 0.5 },

          // South Lift/Stair Core structural boundary
          { id: "F7_SCORE_V1", type: "partition", x1:  12, z1:   5, x2:  12, z2:  30, thickness: 0.5 },
          { id: "F7_SCORE_H1", type: "partition", x1: -15, z1:  20, x2:  12, z2:  20, thickness: 0.5 },

          // Lifts enclosures (Must match below floors)
          { id: "F7_LIFT_SHAFT_W", type: "partition", x1:   5, z1:   5, x2:   5, z2:  20, thickness: 0.5 },
          { id: "F7_LIFT_SHAFT_DIV", type: "partition", x1: 8.5, z1:   5, x2: 8.5, z2:  20, thickness: 0.5 }
        ],
                doors: [
          // LEFT WING NORTH
          { id: "F7_D_C6", wallId: "F7_CORR_N_LW", x: -75, z: -5, width: 3 },
          { id: "F7_D_C10", wallId: "F7_CORR_N_LW", x: -47.5, z: -5, width: 3 },
          // LEFT WING SOUTH
          { id: "F7_D_C7", wallId: "F7_CORR_S_LW", x: -77.5, z: 5, width: 3 },
          { id: "F7_D_C9", wallId: "F7_CORR_S_LW", x: -55, z: 5, width: 3 },
          { id: "F7_D_C8", wallId: "F7_LW_P3", x: -77.5, z: 20, width: 2 }, // C8 to C7
          { id: "F7_D_STAIRS_WEST", wallId: "F7_CORR_S_LW", x: -40, z: 5, width: 4 }, // West Stairs to Corridor
          // CENTER CORE
          { id: "F7_D_TOILET", wallId: "F7_CORR_N_NC", x: -2.5, z: -5, width: 4 },
          { id: "F7_D_LIFT_LOBBY", wallId: "F7_CORR_S_SC", x: -6.5, z: 5, width: 4 },
          { id: "F7_D_STAIRS", wallId: "F7_SCORE_H1", x: -1.5, z: 20, width: 3 },
          // EAST WING NORTH
          { id: "F7_D_C11", wallId: "F7_CORR_N_NC", x: 22.5, z: -5, width: 3 },
          { id: "F7_D_C12", wallId: "F7_CORR_N_NC", x: 47.5, z: -5, width: 3 },
          { id: "F7_D_C13", wallId: "F7_CORR_N_NC", x: 72.5, z: -5, width: 3 },
          { id: "F7_D_C14", wallId: "F7_CORR_N_NC", x: 97.5, z: -5, width: 3 },
          // EAST WING SOUTH
          { id: "F7_D_C17", wallId: "F7_CORR_S_SC", x: 23.5, z: 5, width: 3 },
          { id: "F7_D_C16", wallId: "F7_CORR_S_SC", x: 72.5, z: 5, width: 3 },
          { id: "F7_D_C15", wallId: "F7_CORR_S_SC", x: 97.5, z: 5, width: 3 },
          // CORRIDOR BLOCKER
          { id: "F7_D_CONF", wallId: "F7_MB_P5", x: 85, z: 0, width: 4, isHorizontal: false }
        ],
        windows: [],
        stairs: [
          { id: "F7_STAIRS_WEST", x: -42.0, z: 12.5, width: 6, depth: 15 },
          { id: "F7_STAIRS_MAIN", x: -6.5, z: 18.0, width: 12, depth: 18 }
        ],
        lifts: [
          { id: "F7_LIFT_1", x: 6.0, z: 9.0, width: 4, depth: 4 },
          { id: "F7_LIFT_2", x: 6.0, z: 17.0, width: 4, depth: 4 },
          { id: "F7_LIFT_3", x: 10.5, z: 9.0, width: 4, depth: 4 },
          { id: "F7_LIFT_4", x: 10.5, z: 17.0, width: 4, depth: 4 }
        ],
                columns: []
      },
      nodes: [
          // BLUE MARKERS - Rooms
          { id: "F7_C6", type: "room", name: "Classroom 6", x: -75, z: -20 },
          { id: "F7_C10", type: "room", name: "Classroom 10", x: -47.5, z: -20 },
          { id: "F7_C7", type: "room", name: "Classroom 7", x: -77.5, z: 12.5 },
          { id: "F7_C8", type: "room", name: "Classroom 8", x: -77.5, z: 27.5 },
          { id: "F7_C9", type: "room", name: "Classroom 9", x: -55, z: 20 },
          { id: "F7_TOILET_CORE", type: "room", name: "Toilet Core", x: -2.5, z: -16.5 },
          { id: "F7_LIFT_LOBBY", type: "room", name: "Lift Lobby", x: -1.5, z: 12.5 },
          { id: "F7_C11", type: "room", name: "Classroom 11", x: 22.5, z: -16.5 },
          { id: "F7_C12", type: "room", name: "Classroom 12", x: 47.5, z: -16.5 },
          { id: "F7_C13", type: "room", name: "Classroom 13", x: 72.5, z: -16.5 },
          { id: "F7_C14", type: "room", name: "Classroom 14 (Conf)", x: 97.5, z: -16.5 },
          { id: "F7_C17", type: "room", name: "Classroom 17", x: 23.5, z: 17.5 },
          { id: "F7_C16", type: "room", name: "Classroom 16", x: 72.5, z: 17.5 },
          { id: "F7_C15", type: "room", name: "Classroom 15 (Conf)", x: 97.5, z: 17.5 },
          
          // PURPLE MARKERS - Corridors
          { id: "F7_CORR_W", type: "corridor", name: "West Corridor", x: -50, z: 0 },
          { id: "F7_CORR_C", type: "corridor", name: "Central Corridor", x: 0, z: 0 },
          { id: "F7_CORR_E1", type: "corridor", name: "East Corridor", x: 40, z: 0 },
          { id: "F7_CORR_E2", type: "corridor", name: "Far East Corridor", x: 75, z: 0 },
          { id: "F7_CORR_CONF", type: "corridor", name: "Conference Lobby", x: 95, z: 0 },
          
          // YELLOW MARKERS - Stairs
          { id: "F7_STAIRS_MAIN_NODE", type: "staircase", name: "Main Stairs", x: -6.5, z: 18 },
          { id: "F7_STAIRS_WEST_NODE", type: "staircase", name: "West Stairs", x: -45, z: 0 },
          
          // GREEN MARKERS - Exits
          { id: "F7_EXIT_MAIN", type: "exit", name: "Main Egress", x: -1.5, z: 8 },
          { id: "F7_EXIT_WEST", type: "exit", name: "West Egress", x: -38, z: 0 }
      ,
          // DOOR NODES (M3)
          { id: "F7_D_C6_NODE", type: "door", name: "F7 D C6", x: -75, z: -5 },
          { id: "F7_D_C10_NODE", type: "door", name: "F7 D C10", x: -47.5, z: -5 },
          { id: "F7_D_C7_NODE", type: "door", name: "F7 D C7", x: -77.5, z: 5 },
          { id: "F7_D_C9_NODE", type: "door", name: "F7 D C9", x: -55, z: 5 },
          { id: "F7_D_C8_NODE", type: "door", name: "F7 D C8", x: -77.5, z: 20 },
          { id: "F7_D_STAIRS_WEST_NODE", type: "door", name: "F7 D STAIRS WEST", x: -40, z: 5 },
          { id: "F7_D_TOILET_NODE", type: "door", name: "F7 D TOILET", x: -2.5, z: -5 },
          { id: "F7_D_LIFT_LOBBY_NODE", type: "door", name: "F7 D LIFT LOBBY", x: -6.5, z: 5 },
          { id: "F7_D_STAIRS_NODE", type: "door", name: "F7 D STAIRS", x: -1.5, z: 20 },
          { id: "F7_D_C11_NODE", type: "door", name: "F7 D C11", x: 22.5, z: -5 },
          { id: "F7_D_C12_NODE", type: "door", name: "F7 D C12", x: 47.5, z: -5 },
          { id: "F7_D_C13_NODE", type: "door", name: "F7 D C13", x: 72.5, z: -5 },
          { id: "F7_D_C14_NODE", type: "door", name: "F7 D C14", x: 97.5, z: -5 },
          { id: "F7_D_C17_NODE", type: "door", name: "F7 D C17", x: 23.5, z: 5 },
          { id: "F7_D_C16_NODE", type: "door", name: "F7 D C16", x: 72.5, z: 5 },
          { id: "F7_D_C15_NODE", type: "door", name: "F7 D C15", x: 97.5, z: 5 },
          { id: "F7_D_CONF_NODE", type: "door", name: "F7 D CONF", x: 85, z: 0 }
      ],
      m3Connections: [
          {
                    "from": "F7_C6",
                    "to": "F7_D_C6_NODE"
          },
          {
                    "from": "F7_D_C6_NODE",
                    "to": "F7_CORR_W"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F7_D_C10_NODE"
          },
          {
                    "from": "F7_D_C10_NODE",
                    "to": "F7_CORR_W"
          },
          {
                    "from": "F7_C7",
                    "to": "F7_D_C7_NODE"
          },
          {
                    "from": "F7_D_C7_NODE",
                    "to": "F7_CORR_W"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F7_D_C9_NODE"
          },
          {
                    "from": "F7_D_C9_NODE",
                    "to": "F7_CORR_W"
          },
          {
                    "from": "F7_C7",
                    "to": "F7_D_C8_NODE"
          },
          {
                    "from": "F7_D_C8_NODE",
                    "to": "F7_C8"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F7_D_STAIRS_WEST_NODE"
          },
          {
                    "from": "F7_D_STAIRS_WEST_NODE",
                    "to": "F7_CORR_W"
          },
          {
                    "from": "F7_TOILET_CORE",
                    "to": "F7_D_TOILET_NODE"
          },
          {
                    "from": "F7_D_TOILET_NODE",
                    "to": "F7_CORR_C"
          },
          {
                    "from": "F7_LIFT_LOBBY",
                    "to": "F7_D_LIFT_LOBBY_NODE"
          },
          {
                    "from": "F7_D_LIFT_LOBBY_NODE",
                    "to": "F7_CORR_C"
          },
          {
                    "from": "F7_STAIRS_MAIN_NODE",
                    "to": "F7_D_STAIRS_NODE"
          },
          {
                    "from": "F7_D_STAIRS_NODE",
                    "to": "F7_LIFT_LOBBY"
          },
          {
                    "from": "F7_C11",
                    "to": "F7_D_C11_NODE"
          },
          {
                    "from": "F7_D_C11_NODE",
                    "to": "F7_CORR_E1"
          },
          {
                    "from": "F7_C12",
                    "to": "F7_D_C12_NODE"
          },
          {
                    "from": "F7_D_C12_NODE",
                    "to": "F7_CORR_E1"
          },
          {
                    "from": "F7_C13",
                    "to": "F7_D_C13_NODE"
          },
          {
                    "from": "F7_D_C13_NODE",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_C14",
                    "to": "F7_D_C14_NODE"
          },
          {
                    "from": "F7_D_C14_NODE",
                    "to": "F7_CORR_CONF"
          },
          {
                    "from": "F7_C17",
                    "to": "F7_D_C17_NODE"
          },
          {
                    "from": "F7_D_C17_NODE",
                    "to": "F7_CORR_E1"
          },
          {
                    "from": "F7_C16",
                    "to": "F7_D_C16_NODE"
          },
          {
                    "from": "F7_D_C16_NODE",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_C15",
                    "to": "F7_D_C15_NODE"
          },
          {
                    "from": "F7_D_C15_NODE",
                    "to": "F7_CORR_CONF"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F7_D_CONF_NODE"
          },
          {
                    "from": "F7_D_CONF_NODE",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_STAIRS_MAIN_NODE",
                    "to": "F7_EXIT_MAIN"
          },
          {
                    "from": "F7_STAIRS_WEST_NODE",
                    "to": "F7_EXIT_WEST"
          },
          {
                    "from": "F7_CORR_W",
                    "to": "F7_CORR_C"
          },
          {
                    "from": "F7_CORR_W",
                    "to": "F7_CORR_E1"
          },
          {
                    "from": "F7_CORR_W",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_CORR_C",
                    "to": "F7_CORR_E1"
          },
          {
                    "from": "F7_CORR_C",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_CORR_E1",
                    "to": "F7_CORR_E2"
          },
          {
                    "from": "F7_C10",
                    "to": "F7_D_C10_NODE"
          },
          {
                    "from": "F7_C9",
                    "to": "F7_D_C9_NODE"
          }
],
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildingData;
} else if (typeof window !== "undefined") {
  module.exports = buildingData;
}