import { NextResponse } from 'next/server';
import axios from 'axios';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '5a06494e85e35a78d590712a30f7312917688a89';

export async function POST(req: Request) {
  try {
    const { domain, firstName, lastName, companyName } = await req.json();

    if (!domain && !companyName) {
      return NextResponse.json({ error: 'Domain or company name is required' }, { status: 400 });
    }

    const results: any = { emails: [], domain: domain || '', pattern: '', organization: '' };

    // Step 1: Domain search - find all emails associated with the domain
    if (domain) {
      try {
        const domainSearchUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}`;
        const domainRes = await axios.get(domainSearchUrl);
        const data = domainRes.data?.data;

        if (data) {
          results.domain = data.domain;
          results.pattern = data.pattern || '';
          results.organization = data.organization || '';
          results.acceptAll = data.accept_all || false;

          if (data.emails && data.emails.length > 0) {
            results.emails = data.emails.map((e: any) => ({
              email: e.value,
              type: e.type,
              confidence: e.confidence,
              firstName: e.first_name || '',
              lastName: e.last_name || '',
              position: e.position || '',
              department: e.department || '',
              sources: e.sources?.length || 0,
            }));
          }
        }
      } catch (err: any) {
        console.error('Domain search error:', err.response?.data || err.message);
      }
    }

    // Step 2: If first/last name provided, do a specific email finder
    if (domain && firstName && lastName) {
      try {
        const finderUrl = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_API_KEY}`;
        const finderRes = await axios.get(finderUrl);
        const finderData = finderRes.data?.data;

        if (finderData && finderData.email) {
          results.specificEmail = {
            email: finderData.email,
            confidence: finderData.score || 0,
            firstName: finderData.first_name || firstName,
            lastName: finderData.last_name || lastName,
            position: finderData.position || '',
          };
        }
      } catch (err: any) {
        console.error('Email finder error:', err.response?.data || err.message);
      }
    }

    // Step 3: Generate common pattern guesses if no results
    if (results.emails.length === 0 && domain) {
      const patterns = [
        `info@${domain}`,
        `contact@${domain}`,
        `hello@${domain}`,
        `admin@${domain}`,
        `support@${domain}`,
        `office@${domain}`,
      ];
      if (firstName && lastName) {
        const f = firstName.toLowerCase();
        const l = lastName.toLowerCase();
        patterns.unshift(
          `${f}@${domain}`,
          `${f}.${l}@${domain}`,
          `${f}${l}@${domain}`,
          `${f[0]}${l}@${domain}`,
        );
      }
      results.guessedEmails = patterns;
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Find email error:', error);
    return NextResponse.json({ error: 'Failed to find emails' }, { status: 500 });
  }
}
