const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔧 Тестируем подключение к MongoDB Atlas...');
  console.log('Используемый URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Успешное подключение к MongoDB Atlas!');
    console.log('📁 Хост:', conn.connection.host);
    console.log('📊 База данных:', conn.connection.db.databaseName);
    console.log('👤 Пользователь:', conn.connection.client.s.options.auth.username);

    // Закрываем соединение
    await mongoose.connection.close();
    console.log('🔌 Соединение закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.error('⚠️  Проблема с DNS. Проверьте интернет соединение.');
    } else if (error.code === 'ETIMEOUT') {
      console.error('⚠️  Таймаут подключения. Проверьте URI и доступность MongoDB Atlas.');
    } else if (error.code === 'ENETUNREACH') {
      console.error('⚠️  Сеть недоступна. Проверьте интернет соединение.');
    }

    process.exit(1);
  }
}

testConnection();