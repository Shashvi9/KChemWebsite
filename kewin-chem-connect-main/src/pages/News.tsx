import { Rocket, Megaphone } from "lucide-react"; // import icons

const News = () => {
  const newsItems = [
    {
      title: "Test",
      date: "Jan. 24, 2021, 8:23 a.m.",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and",
      image: "/images/news1.jpg",
      icon: <Rocket className="w-6 h-6 text-primary" />,
    },
    {
      title: "Test 2",
      date: "Jan. 23, 2021, 6:59 p.m.",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into",
      image: "/images/news2.jpg",
      icon: <Megaphone className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">
          Kewin Chemicals News Feed
        </h1>

        <div className="flex flex-col gap-12 max-w-6xl mx-auto">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-6 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Image */}
              <div className="w-full md:w-1/2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="rounded-2xl shadow-lg w-full object-cover h-64"
                />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2 relative bg-background rounded-2xl shadow-lg p-6 border border-border">
                {/* Icon Badge */}
                <div className="absolute -top-4 -left-4 bg-primary-light p-2 rounded-full shadow-lg flex items-center justify-center">
                  {item.icon}
                </div>

                <h2 className="text-xl font-semibold text-primary-dark mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{item.date}</p>
                <p className="text-muted-foreground">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
