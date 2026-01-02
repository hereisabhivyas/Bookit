interface CategoryCardProps {
  icon: string;
  title: string;
  count: number;
  onClick?: () => void;
}

const CategoryCard = ({ icon, title, count, onClick }: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group glass-card p-6 text-center cursor-pointer hover-lift"
    >
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {count} events
      </p>
    </div>
  );
};

export default CategoryCard;
