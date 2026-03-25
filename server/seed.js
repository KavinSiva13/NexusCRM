import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm_db';

const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String }, { timestamps: true });
const leadSchema = new mongoose.Schema({ name: String, phone: String, email: String, company: String, source: String, status: String, notes: String, followUpDate: Date, assignedTo: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const customerSchema = new mongoose.Schema({ name: String, company: String, email: String, phone: String, address: String, services: [String], paymentStatus: String, accountManager: mongoose.Schema.Types.ObjectId, notes: String, revenue: Number, createdBy: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const taskSchema = new mongoose.Schema({ title: String, description: String, dueDate: Date, assignedTo: mongoose.Schema.Types.ObjectId, status: String, priority: String, createdBy: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const activitySchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, action: String, entity: String, entityId: mongoose.Schema.Types.ObjectId, entityName: String }, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Lead = mongoose.model('Lead', leadSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Task = mongoose.model('Task', taskSchema);
const Activity = mongoose.model('Activity', activitySchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await Lead.deleteMany();
  await Customer.deleteMany();
  await Task.deleteMany();
  await Activity.deleteMany();
  console.log('Cleared existing data');

  const adminPw = await bcrypt.hash('admin123', 10);
  const staffPw = await bcrypt.hash('staff123', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: adminPw, role: 'admin' });
  const staff1 = await User.create({ name: 'Sarah Johnson', email: 'sarah@demo.com', password: staffPw, role: 'staff' });
  const staff2 = await User.create({ name: 'Mike Chen', email: 'mike@demo.com', password: staffPw, role: 'staff' });
  console.log('Created users');

  const leadsData = [
    { name: 'Alice Thompson', phone: '+1 555 0101', email: 'alice@techcorp.com', company: 'TechCorp Inc.', source: 'Website', status: 'New', notes: 'Interested in enterprise plan', followUpDate: new Date(Date.now() + 2 * 86400000), assignedTo: staff1._id },
    { name: 'Bob Martinez', phone: '+1 555 0102', email: 'bob@startupxyz.com', company: 'Startup XYZ', source: 'Referral', status: 'Contacted', notes: 'Demo scheduled for next week', followUpDate: new Date(Date.now() + 5 * 86400000), assignedTo: staff2._id },
    { name: 'Carol White', phone: '+1 555 0103', email: 'carol@designstudio.com', company: 'Design Studio', source: 'Ads', status: 'Follow-up', notes: 'Requested pricing details', assignedTo: staff1._id },
    { name: 'David Kim', phone: '+1 555 0104', email: 'david@globalretail.com', company: 'Global Retail', source: 'Social Media', status: 'Converted', notes: 'Closed deal - premium plan', assignedTo: admin._id },
    { name: 'Emma Davis', phone: '+1 555 0105', email: 'emma@healthplus.com', company: 'HealthPlus', source: 'Website', status: 'Lost', notes: 'Went with competitor', assignedTo: staff2._id },
    { name: 'Frank Wilson', phone: '+1 555 0106', email: 'frank@financegroup.com', company: 'Finance Group', source: 'Referral', status: 'New', followUpDate: new Date(Date.now() + 3 * 86400000), assignedTo: staff1._id },
    { name: 'Grace Lee', phone: '+1 555 0107', email: 'grace@ecommerce.com', company: 'E-Commerce Hub', source: 'Ads', status: 'Contacted', notes: 'Sent proposal', assignedTo: staff2._id },
    { name: 'Henry Brown', phone: '+1 555 0108', email: 'henry@logistics.com', company: 'Logistics Pro', source: 'Website', status: 'New', followUpDate: new Date(Date.now() + 7 * 86400000), assignedTo: admin._id },
  ];

  const leads = await Lead.insertMany(leadsData.map(l => ({ ...l, createdBy: admin._id })));
  console.log('Created leads');

  const customers = await Customer.insertMany([
    { name: 'Jennifer Adams', company: 'AdTech Solutions', email: 'jen@adtech.com', phone: '+1 555 0201', address: '123 Tech St, SF, CA', services: ['CRM Setup', 'Training', 'Support'], paymentStatus: 'Paid', accountManager: staff1._id, revenue: 12500, notes: 'Long-term client since 2022', createdBy: admin._id },
    { name: 'Robert Chang', company: 'CloudBase Inc.', email: 'robert@cloudbase.com', phone: '+1 555 0202', address: '456 Cloud Ave, NY', services: ['Enterprise Plan', 'API Access'], paymentStatus: 'Paid', accountManager: staff2._id, revenue: 28000, createdBy: admin._id },
    { name: 'Susan Torres', company: 'MediaGroup', email: 'susan@mediagroup.com', phone: '+1 555 0203', address: '789 Media Blvd, LA', services: ['Pro Plan'], paymentStatus: 'Pending', accountManager: staff1._id, revenue: 4800, createdBy: admin._id },
    { name: 'James Park', company: 'InnovateTech', email: 'james@innovate.com', phone: '+1 555 0204', address: '321 Innovation Dr, Seattle', services: ['Starter Plan', 'Consulting'], paymentStatus: 'Overdue', accountManager: admin._id, revenue: 3200, createdBy: admin._id },
  ]);
  console.log('Created customers');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  await Task.insertMany([
    { title: 'Follow up with Alice Thompson', description: 'Send pricing proposal and schedule demo call', dueDate: tomorrow, assignedTo: staff1._id, status: 'Pending', priority: 'High', createdBy: admin._id },
    { title: 'Prepare Q4 report', description: 'Compile sales metrics and customer growth data', dueDate: new Date(Date.now() + 7 * 86400000), assignedTo: admin._id, status: 'In Progress', priority: 'Medium', createdBy: admin._id },
    { title: 'Demo call with Bob Martinez', description: 'Product walkthrough and Q&A session', dueDate: tomorrow, assignedTo: staff2._id, status: 'Pending', priority: 'High', createdBy: admin._id },
    { title: 'Update CRM documentation', description: 'Refresh onboarding guides', dueDate: new Date(Date.now() + 14 * 86400000), assignedTo: staff1._id, status: 'Pending', priority: 'Low', createdBy: admin._id },
    { title: 'Send invoice to MediaGroup', dueDate: yesterday, assignedTo: admin._id, status: 'Pending', priority: 'High', createdBy: admin._id },
    { title: 'Onboard InnovateTech', description: 'Setup and training session', dueDate: new Date(), assignedTo: staff2._id, status: 'Completed', priority: 'Medium', createdBy: admin._id },
  ]);
  console.log('Created tasks');

  const activities = [];
  for (const lead of leads) {
    activities.push({ user: admin._id, action: 'Created lead', entity: 'Lead', entityId: lead._id, entityName: lead.name, createdAt: new Date(Date.now() - Math.random() * 7 * 86400000) });
  }
  for (const customer of customers) {
    activities.push({ user: staff1._id, action: 'Added customer', entity: 'Customer', entityId: customer._id, entityName: customer.name, createdAt: new Date(Date.now() - Math.random() * 5 * 86400000) });
  }
  await Activity.insertMany(activities);
  console.log('Created activities');

  console.log('\n✅ Seed complete!');
  console.log('📧 Admin: admin@demo.com / admin123');
  console.log('📧 Staff: sarah@demo.com / staff123');
  console.log('📧 Staff: mike@demo.com / staff123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
