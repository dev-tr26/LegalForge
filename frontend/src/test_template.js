// test_templates.js
import { getTemplates } from './services/api';

const testTemplates = async () => {
  try {
    console.log('Fetching templates...');
    const response = await getTemplates();
    console.log('Templates response:', response);
    console.log('Templates array:', response.templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    console.error('Error details:', error.response);
  }
};

testTemplates();