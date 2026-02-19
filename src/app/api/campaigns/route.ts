import { NextRequest, NextResponse } from 'next/server';

export interface Campaign {
  id: string;
  name: string;
  sequence: CampaignStep[];
  prospects: CampaignProspect[];
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
}

export interface CampaignStep {
  day: number;
  type: 'email' | 'sms';
  content: string;
  subject?: string;
}

export interface CampaignProspect {
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  currentStep: number;
  status: 'pending' | 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

// This is a simple in-memory storage for demo purposes
// In production, use a database
const campaigns: Map<string, Campaign> = new Map();

export async function GET(request: NextRequest) {
  try {
    const campaignArray = Array.from(campaigns.values());
    return NextResponse.json(campaignArray);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, campaign, campaignId, prospectId, stepIndex } = await request.json();

    if (action === 'create') {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: campaign.name,
        sequence: campaign.sequence,
        prospects: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      campaigns.set(newCampaign.id, newCampaign);
      return NextResponse.json(newCampaign);
    }

    if (action === 'addProspect') {
      const camp = campaigns.get(campaignId);
      if (!camp) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const newProspect: CampaignProspect = {
        prospectId,
        prospectName: campaign.prospectName,
        prospectEmail: campaign.prospectEmail,
        currentStep: 0,
        status: 'pending',
        startedAt: new Date().toISOString(),
      };

      camp.prospects.push(newProspect);
      campaigns.set(campaignId, camp);
      return NextResponse.json(camp);
    }

    if (action === 'updateProspectStep') {
      const camp = campaigns.get(campaignId);
      if (!camp) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const prospect = camp.prospects.find((p) => p.prospectId === prospectId);
      if (!prospect) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
      }

      prospect.currentStep = stepIndex;
      prospect.status = stepIndex >= camp.sequence.length ? 'completed' : 'in-progress';
      if (prospect.status === 'completed') {
        prospect.completedAt = new Date().toISOString();
      }

      campaigns.set(campaignId, camp);
      return NextResponse.json(camp);
    }

    if (action === 'updateStatus') {
      const camp = campaigns.get(campaignId);
      if (!camp) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      camp.status = campaign.status;
      campaigns.set(campaignId, camp);
      return NextResponse.json(camp);
    }

    if (action === 'delete') {
      campaigns.delete(campaignId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
