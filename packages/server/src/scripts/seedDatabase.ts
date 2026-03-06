import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import { Region } from '../models/Region.model';
import { Indicator } from '../models/Indicator.model';
import { User } from '../models/User.model';
import { Prediction } from '../models/Prediction.model';

const seedDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI не задан');
        await mongoose.connect(mongoUri);
        console.log('✅ Подключено к MongoDB');

        console.log('🧹 Очистка коллекций...');
        await Region.deleteMany({});
        await Indicator.deleteMany({});
        await User.deleteMany({});
        await Prediction.deleteMany({});

        console.log('🌱 Добавляем тестовые регионы...');
        const regions = [
            { code: '77', name: 'Москва', population: 13000000, area: 2561, hci: 0.85, federalDistrict: 'Центральный' },
            { code: '78', name: 'Санкт-Петербург', population: 5600000, area: 1439, hci: 0.78, federalDistrict: 'Северо-Западный' },
            { code: '54', name: 'Новосибирская область', population: 2800000, area: 177756, hci: 0.65, federalDistrict: 'Сибирский' },
            { code: '66', name: 'Свердловская область', population: 4300000, area: 194307, hci: 0.72, federalDistrict: 'Уральский' },
            { code: '23', name: 'Краснодарский край', population: 5700000, area: 75485, hci: 0.68, federalDistrict: 'Южный' },
        ];
        await Region.insertMany(regions);
        console.log(`✅ Добавлено ${regions.length} регионов`);

        console.log('🌱 Добавляем тестовые индикаторы...');
        const indicators = [];
        const years = [2020, 2021, 2022, 2023];
        for (const region of regions) {
            for (const year of years) {
                indicators.push({
                    regionCode: region.code,
                    year,
                    education: {
                        literacyRate: 95 + Math.random() * 5,
                        higherEducationRate: 40 + Math.random() * 20,
                        schoolEnrollment: 90 + Math.random() * 8,
                    },
                    health: {
                        lifeExpectancy: 70 + Math.random() * 8,
                        mortalityRate: 8 + Math.random() * 4,
                        hospitalBeds: 70 + Math.random() * 20,
                    },
                    economy: {
                        gdpPerCapita: 500000 + Math.random() * 200000,
                        unemploymentRate: 3 + Math.random() * 6,
                        averageSalary: 40000 + Math.random() * 30000,
                    },
                    social: {
                        povertyRate: 8 + Math.random() * 10,
                        crimeRate: 1000 + Math.random() * 500,
                        housingPerCapita: 20 + Math.random() * 10,
                    },
                    humanCapitalIndex: region.hci + (Math.random() - 0.5) * 0.05,
                });
            }
        }
        await Indicator.insertMany(indicators);
        console.log(`✅ Добавлено ${indicators.length} индикаторов`);

        console.log('🌱 Добавляем тестового пользователя-администратора...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = {
            username: 'admin',
            email: 'admin@phd-platform.local',
            password: hashedPassword,
            passwordHash: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isActive: true,
        };
        await User.create(adminUser);
        console.log('✅ Администратор создан (email: admin@phd-platform.local, пароль: admin123)');

        console.log('🎉 База данных успешно заполнена тестовыми данными');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();