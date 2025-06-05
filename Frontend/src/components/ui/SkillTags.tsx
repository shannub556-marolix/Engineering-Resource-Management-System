
import { Badge } from '@/components/ui/badge';

interface SkillTagsProps {
  skills: string[];
  className?: string;
}

export const SkillTags = ({ skills, className }: SkillTagsProps) => {
  if (!skills || skills.length === 0) {
    return <span className="text-gray-500">No skills</span>;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {skills.map((skill, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {skill}
        </Badge>
      ))}
    </div>
  );
};
