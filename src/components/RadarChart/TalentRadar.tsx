import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Domain, DomainResult, IdealProfile } from '../../types';

interface CandidateData {
  name: string;
  color: string;
  scores: DomainResult[];
  matchScore?: number;
}

interface TalentRadarProps {
  idealProfile: IdealProfile;
  candidates?: CandidateData[];
  domains: Domain[];
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
}

const SIZES = { sm: 200, md: 350, lg: 500 };

function buildChartData(
  domains: Domain[],
  idealProfile: IdealProfile,
  candidates: CandidateData[]
) {
  return domains.map((d) => {
    const target = idealProfile.domainTargets.find((t) => t.domainId === d.id);
    const entry: Record<string, string | number> = {
      subject: d.name,
      ideal: target?.targetScore ?? 0,
    };
    candidates.forEach((c) => {
      const score = c.scores.find((s) => s.domainId === d.id);
      entry[c.name] = score?.score ?? 0;
    });
    return entry;
  });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-gray-800">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function TalentRadar({
  idealProfile,
  candidates = [],
  domains,
  size = 'md',
  showLegend = false,
}: TalentRadarProps) {
  const px = SIZES[size];
  const data = buildChartData(domains, idealProfile, candidates);

  const CANDIDATE_COLORS = [
    '#F97316',
    '#10B981',
    '#8B5CF6',
    '#EF4444',
    '#EC4899',
    '#0EA5E9',
    '#84CC16',
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={px}>
        <RadarChart cx="50%" cy="50%" outerRadius={px * 0.38} data={data}>
          <PolarGrid gridType="polygon" stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: size === 'sm' ? 10 : 12, fill: '#374151', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Perfil ideal — área rellena azul */}
          <Radar
            name="Perfil Ideal"
            dataKey="ideal"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.2}
            strokeWidth={2}
          />

          {/* Un radar por candidato */}
          {candidates.map((c, i) => (
            <Radar
              key={c.name}
              name={c.name}
              dataKey={c.name}
              stroke={c.color || CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}
              fill="none"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: '#3B82F6', opacity: 0.6 }}
            />
            <span className="text-gray-600">Perfil Ideal</span>
          </div>
          {candidates.map((c, i) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2 w-6 rounded-full"
                style={{
                  backgroundColor:
                    c.color || CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
                }}
              />
              <span className="text-gray-600">{c.name}</span>
              {c.matchScore !== undefined && (
                <span className="font-medium text-gray-800">({c.matchScore}%)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
