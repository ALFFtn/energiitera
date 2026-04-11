"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
async function seed() {
    console.log('🌱 Seeding database...\n');
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await database_js_1.db.delete(index_js_1.panelEvents);
    await database_js_1.db.delete(index_js_1.panelReadings);
    await database_js_1.db.delete(index_js_1.gridMetrics);
    await database_js_1.db.delete(index_js_1.alerts);
    await database_js_1.db.delete(index_js_1.panels);
    await database_js_1.db.delete(index_js_1.buildings);
    await database_js_1.db.delete(index_js_1.zones);
    await database_js_1.db.delete(index_js_1.departments);
    await database_js_1.db.delete(index_js_1.campuses);
    await database_js_1.db.delete(index_js_1.users);
    // Create admin user
    console.log('Creating users...');
    const passwordHash = await bcryptjs_1.default.hash('password', 12);
    const adminResult = await database_js_1.db.insert(index_js_1.users).values({
        email: 'admin@gridmonitor.iot',
        passwordHash,
        name: 'Admin User',
        role: 'admin',
    }).$returningId();
    const [adminUser] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, adminResult[0].id));
    await database_js_1.db.insert(index_js_1.users).values([
        { email: 'engineer@gridmonitor.iot', passwordHash, name: 'John Engineer', role: 'engineer' },
        { email: 'operator@gridmonitor.iot', passwordHash, name: 'Jane Operator', role: 'operator' },
    ]);
    // Create campus
    console.log('Creating campus and zones...');
    const campusResult = await database_js_1.db.insert(index_js_1.campuses).values({
        name: 'Main Campus',
        location: 'Austin, TX',
        timezone: 'America/Chicago',
    }).$returningId();
    const [mainCampus] = await database_js_1.db.select().from(index_js_1.campuses).where((0, drizzle_orm_1.eq)(index_js_1.campuses.id, campusResult[0].id));
    // Create zones
    const zoneAResult = await database_js_1.db.insert(index_js_1.zones).values({ campusId: mainCampus.id, code: 'A', name: 'Research', status: 'normal' }).$returningId();
    const [zoneA] = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, zoneAResult[0].id));
    const zoneBResult = await database_js_1.db.insert(index_js_1.zones).values({ campusId: mainCampus.id, code: 'B', name: 'Admin', status: 'warning' }).$returningId();
    const [zoneB] = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, zoneBResult[0].id));
    const zoneCResult = await database_js_1.db.insert(index_js_1.zones).values({ campusId: mainCampus.id, code: 'C', name: 'Dorms', status: 'normal' }).$returningId();
    const [zoneC] = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, zoneCResult[0].id));
    // Create departments
    console.log('Creating departments...');
    await database_js_1.db.insert(index_js_1.departments).values([
        { campusId: mainCampus.id, name: 'Research Labs', color: 'bg-primary' },
        { campusId: mainCampus.id, name: 'Student Dormitories', color: 'bg-indigo-500' },
        { campusId: mainCampus.id, name: 'Administration', color: 'bg-cyan-500' },
        { campusId: mainCampus.id, name: 'Sports Complex', color: 'bg-amber-500' },
    ]);
    // Create buildings
    console.log('Creating buildings...');
    const engQuadResult = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneA.id,
        code: 'ENG',
        name: 'Engineering Quad',
        description: 'Main engineering research facility',
        status: 'operational',
        gridConnection: 'primary',
        mapCoordinates: { x: 100, y: 200, width: 100, height: 100 },
    }).$returningId();
    const [engQuad] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, engQuadResult[0].id));
    const adminHallResult = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneB.id,
        code: 'ADM',
        name: 'Admin Hall',
        description: 'Administrative offices',
        status: 'operational',
        mapCoordinates: { x: 280, y: 100, width: 120, height: 80 },
    }).$returningId();
    const [adminHall] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, adminHallResult[0].id));
    const dormsResult = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneC.id,
        code: 'DRM',
        name: 'Dorms West',
        description: 'Western dormitory complex',
        status: 'warning',
        mapCoordinates: { x: 280, y: 320, width: 170, height: 100 },
    }).$returningId();
    const [dorms] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, dormsResult[0].id));
    const scienceLabsResult = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneA.id,
        code: 'SCI',
        name: 'Science Labs',
        description: 'Chemistry and physics laboratories',
        status: 'critical',
        mapCoordinates: { x: 500, y: 120, width: 150, height: 100 },
    }).$returningId();
    const [scienceLabs] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, scienceLabsResult[0].id));
    const libraryResult = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneB.id,
        code: 'LIB',
        name: 'Main Library',
        description: 'Campus library',
        status: 'operational',
        mapCoordinates: { x: 550, y: 300, width: 150, height: 100 },
    }).$returningId();
    const [library] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, libraryResult[0].id));
    const building404Result = await database_js_1.db.insert(index_js_1.buildings).values({
        zoneId: zoneA.id,
        code: '404',
        name: 'Building 404 - Engineering Wing',
        description: 'Engineering wing with server room',
        status: 'operational',
    }).$returningId();
    const [building404] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, building404Result[0].id));
    // Create panels for Building 404
    console.log('Creating panels...');
    const panelData = [
        { code: '1A', name: 'Panel 1A', description: 'Main Distribution', location: 'Basement', status: 'normal' },
        { code: '1B', name: 'Panel 1B', description: 'HVAC Systems', location: 'Basement', status: 'normal' },
        { code: '2A', name: 'Panel 2A', description: 'Lighting Control', location: 'Floor 1', status: 'warning' },
        { code: '2B', name: 'Panel 2B', description: 'Server Room UPS', location: 'Floor 1', status: 'normal' },
        { code: '3A', name: 'Panel 3A', description: 'Auxiliary Power', location: 'Floor 2', status: 'offline' },
        { code: '3B', name: 'Panel 3B', description: 'Lab Equipment', location: 'Floor 2', status: 'normal' },
        { code: '4A', name: 'Panel 4A', description: 'Emergency Lighting', location: 'Floor 3', status: 'normal' },
        { code: '4B', name: 'Panel 4B', description: 'Server Room', location: 'Server Room', status: 'normal' },
    ];
    const insertedPanels = [];
    for (const p of panelData) {
        const result = await database_js_1.db.insert(index_js_1.panels).values({
            buildingId: building404.id,
            ...p,
            uptimeSeconds: Math.floor(Math.random() * 10000000),
            startedAt: new Date(Date.now() - Math.random() * 86400000 * 30),
        }).$returningId();
        const [panel] = await database_js_1.db.select().from(index_js_1.panels).where((0, drizzle_orm_1.eq)(index_js_1.panels.id, result[0].id));
        insertedPanels.push(panel);
    }
    // Create sample readings for each panel
    console.log('Creating panel readings...');
    for (const panel of insertedPanels) {
        const readings = [];
        for (let i = 0; i < 10; i++) {
            readings.push({
                panelId: panel.id,
                timestamp: new Date(Date.now() - i * 3600000),
                voltageLn: (228 + Math.random() * 6).toFixed(2),
                currentTotal: (80 + Math.random() * 100).toFixed(2),
                currentPhaseA: (30 + Math.random() * 20).toFixed(2),
                currentPhaseB: (30 + Math.random() * 20).toFixed(2),
                currentPhaseC: (30 + Math.random() * 20).toFixed(2),
                powerFactor: (0.9 + Math.random() * 0.1).toFixed(3),
                frequency: (59.9 + Math.random() * 0.2).toFixed(3),
                powerKw: (20 + Math.random() * 50).toFixed(2),
                signalQuality: Math.floor(85 + Math.random() * 15),
            });
        }
        await database_js_1.db.insert(index_js_1.panelReadings).values(readings);
    }
    // Create alerts
    console.log('Creating alerts...');
    await database_js_1.db.insert(index_js_1.alerts).values([
        {
            buildingId: scienceLabs.id,
            severity: 'critical',
            title: 'HVAC Unit 4 Failure',
            message: 'Science Labs (Zone D) - Temperature rising rapidly. Check compressor.',
            status: 'active',
        },
        {
            buildingId: dorms.id,
            severity: 'warning',
            title: 'Voltage Spike Detected',
            message: 'Dorms (West) - Transient voltage surge detected on Main Bus B.',
            status: 'active',
        },
        {
            buildingId: adminHall.id,
            severity: 'info',
            title: 'Scheduled Maintenance',
            message: 'Admin Hall - Generator test completed successfully.',
            status: 'active',
        },
        {
            severity: 'log',
            title: 'Network Latency',
            message: 'Backbone Switch 02 - Latency returned to normal levels.',
            status: 'resolved',
            resolvedAt: new Date(),
        },
    ]);
    // Create panel events
    console.log('Creating panel events...');
    const panel4B = insertedPanels.find(p => p.code === '4B');
    if (panel4B) {
        await database_js_1.db.insert(index_js_1.panelEvents).values([
            { panelId: panel4B.id, type: 'normalized', severity: 'success', title: 'System Normalized', description: 'Voltage stabilized within nominal range.' },
            { panelId: panel4B.id, type: 'spike', severity: 'warning', title: 'Minor Voltage Spike', description: 'Phase A experienced momentary surge (+2%).' },
            { panelId: panel4B.id, type: 'access', severity: 'info', title: 'Maintenance Access', description: 'Engineer J. Doe logged in locally.', userId: adminUser.id },
        ]);
    }
    // Create grid metrics
    console.log('Creating grid metrics...');
    for (let i = 0; i < 24; i++) {
        await database_js_1.db.insert(index_js_1.gridMetrics).values({
            campusId: mainCampus.id,
            timestamp: new Date(Date.now() - i * 3600000),
            totalLoadMw: (40 + Math.random() * 15).toFixed(3),
            frequencyHz: (59.9 + Math.random() * 0.2).toFixed(3),
            powerFactor: (0.95 + Math.random() * 0.05).toFixed(3),
            activeAlarms: Math.floor(Math.random() * 5),
            carbonFootprintTons: (7 + Math.random() * 3).toFixed(2),
            estimatedCostPerHour: (400 + Math.random() * 100).toFixed(2),
        });
    }
    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test credentials:');
    console.log('  Email: admin@gridmonitor.iot');
    console.log('  Password: password\n');
    process.exit(0);
}
seed().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map