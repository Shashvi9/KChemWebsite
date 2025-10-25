// // import { Link } from 'react-router-dom';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// // import { ArrowRight, Palette, Heart, Beaker, Sparkles } from 'lucide-react';

// // const categories = [
// //   {
// //     id: 'dyes-intermediates',
// //     title: 'Dyes & Intermediates',
// //     description: 'Comprehensive range of acid dyes, basic dyes, reactive dyes, and chemical intermediates for textile and industrial applications.',
// //     icon: Palette,
// //     href: '/dyes-intermediates',
// //     color: 'from-blue-500 to-blue-600',
// //     products: ['Acid Dyes', 'Basic Dyes', 'Reactive Dyes', 'Direct Dyes', 'Solvent Dyes'],
// //   },
// //   {
// //     id: 'food-pharma',
// //     title: 'Food & Pharma Colors',
// //     description: 'FDA-approved food colors, pharmaceutical grades, and lake colors meeting international safety standards.',
// //     icon: Heart,
// //     href: '/food-pharma',
// //     color: 'from-green-500 to-green-600',
// //     products: ['Food Colors', 'Lake Colors', 'Pharma Grade', 'Natural Colors'],
// //   },
// //   {
// //     id: 'shades-pigments',
// //     title: 'Shades & Pigments',
// //     description: 'High-performance pigments and colorants for paints, coatings, plastics, and printing applications.',
// //     icon: Beaker,
// //     href: '/shades-pigments',
// //     color: 'from-purple-500 to-purple-600',
// //     products: ['Organic Pigments', 'Inorganic Pigments', 'Special Effects', 'Dispersions'],
// //   },
// //   {
// //     id: 'varieties-cosmetics',
// //     title: 'Cosmetic Varieties',
// //     description: 'Safe and vibrant colors for cosmetics, personal care products, and beauty applications.',
// //     icon: Sparkles,
// //     href: '/varieties-cosmetics',
// //     color: 'from-pink-500 to-pink-600',
// //     products: ['Cosmetic Colors', 'Mica', 'Pearl Pigments', 'Special Effects'],
// //   },
// // ];

// // const ProductSegment = () => {
// //   return (
// //     <section className="py-20 bg-gradient-light">
// //       <div className="container mx-auto px-4">
// //         <div className="text-center mb-16 animate-fade-in">
// //           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
// //             Product Segment
// //           </h2>
// //           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
// //             Explore our premium chemical product segments. Each category contains high-quality solutions tailored to industry needs.
// //           </p>
// //         </div>

// //         <div className="grid md:grid-cols-2 gap-8 mb-12">
// //           {categories.map((category, index) => (
// //             <Card 
// //               key={category.id} 
// //               className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up"
// //               style={{ animationDelay: `${index * 0.1}s` }}
// //             >
// //               <CardHeader className="pb-4">
// //                 <div className="flex items-center gap-4 mb-4">
// //                   <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
// //                     <category.icon className="h-8 w-8 text-white" />
// //                   </div>
// //                   <div>
// //                     <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
// //                       {category.title}
// //                     </CardTitle>
// //                   </div>
// //                 </div>
// //                 <CardDescription className="text-base leading-relaxed">
// //                   {category.description}
// //                 </CardDescription>
// //               </CardHeader>
              
// //               <CardContent className="pt-0">
// //                 <div className="space-y-4">
// //                   <div className="flex flex-wrap gap-2">
// //                     {category.products.map((product) => (
// //                       <span
// //                         key={product}
// //                         className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
// //                       >
// //                         {product}
// //                       </span>
// //                     ))}
// //                   </div>
                  
// //                   <div className="flex items-center justify-between pt-4">
// //                     <Link to={category.href}>
// //                       <Button variant="ghost" className="group/btn p-0 h-auto font-semibold">
// //                         Explore Products
// //                         <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
// //                       </Button>
// //                     </Link>
                    
// //                     <Button variant="outline" size="sm">
// //                       Request Sample
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>

// //         <div className="text-center animate-fade-in">
// //           <div className="bg-primary-light rounded-2xl p-8 md:p-12">
// //             <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
// //               Need Custom Solutions?
// //             </h3>
// //             <p className="text-lg text-primary-dark/80 mb-6 max-w-2xl mx-auto">
// //               Our technical team specializes in developing customized chemical solutions to meet your specific requirements and applications.
// //             </p>
// //             <div className="flex flex-col sm:flex-row gap-4 justify-center">
// //               <Button size="lg" className="font-semibold">
// //                 Contact Our Experts
// //               </Button>
// //               <Button variant="outline" size="lg">
// //                 View All Products
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default ProductSegment;


// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { ArrowRight, Palette, Heart, Beaker, Sparkles } from 'lucide-react';

// const categories = [
//   {
//     id: 'dyes-intermediates',
//     title: 'Dyes & Intermediates',
//     description:
//       'Comprehensive range of acid dyes, basic dyes, reactive dyes, and chemical intermediates for textile and industrial applications.',
//     icon: Palette,
//     href: '/dyes-intermediates',
//     color: 'from-blue-500 to-blue-600',
//     products: ['Acid Dyes', 'Basic Dyes', 'Reactive Dyes', 'Direct Dyes', 'Solvent Dyes'],
//   },
//   {
//     id: 'food-pharma',
//     title: 'Food & Pharma Colors',
//     description: 'FDA-approved food colors, pharmaceutical grades, and lake colors meeting international safety standards.',
//     icon: Heart,
//     href: '/food-pharma',
//     color: 'from-green-500 to-green-600',
//     products: ['Food Colors', 'Lake Colors', 'Pharma Grade', 'Natural Colors'],
//   },
//   {
//     id: 'shades-pigments',
//     title: 'Shades & Pigments',
//     description:
//       'High-performance pigments and colorants for paints, coatings, plastics, and printing applications.',
//     icon: Beaker,
//     href: '/shades-pigments',
//     color: 'from-purple-500 to-purple-600',
//     products: ['Organic Pigments', 'Inorganic Pigments', 'Special Effects', 'Dispersions'],
//   },
//   {
//     id: 'varieties-cosmetics',
//     title: 'Cosmetic Varieties',
//     description: 'Safe and vibrant colors for cosmetics, personal care products, and beauty applications.',
//     icon: Sparkles,
//     href: '/varieties-cosmetics',
//     color: 'from-pink-500 to-pink-600',
//     products: ['Cosmetic Colors', 'Mica', 'Pearl Pigments', 'Special Effects'],
//   },
// ];

// const ProductSegment = () => {
//   const navigate = useNavigate();

//   return (
//     <section className="py-20 bg-gradient-light">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-16 animate-fade-in">
//           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Product Segment</h2>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             Explore our premium chemical product segments. Each category contains high-quality solutions tailored to
//             industry needs.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8 mb-12">
//           {categories.map((category, index) => (
//             <Card
//               key={category.id}
//               onClick={() => navigate(category.href)} // Entire card clickable
//               className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <CardHeader className="pb-4">
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
//                     <category.icon className="h-8 w-8 text-white" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
//                       {category.title}
//                     </CardTitle>
//                   </div>
//                 </div>
//                 <CardDescription className="text-base leading-relaxed">{category.description}</CardDescription>
//               </CardHeader>

//               <CardContent className="pt-0">
//                 <div className="space-y-4">
//                   <div className="flex flex-wrap gap-2">
//                     {category.products.map((product) => (
//                       <span
//                         key={product}
//                         className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
//                       >
//                         {product}
//                       </span>
//                     ))}
//                   </div>

//                   <div className="flex items-center justify-between pt-4">
//                     <div className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium text-sm">
//                       Explore Products
//                       <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
//                     </div>

//                     <Button
//                       onClick={(e) => {
//                         e.stopPropagation(); // Prevent card click
//                         alert('Request Sample Clicked'); // Replace with your logic
//                       }}
//                       variant="outline"
//                       size="sm"
//                     >
//                       Request Sample
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="text-center animate-fade-in">
//           <div className="bg-primary-light rounded-2xl p-8 md:p-12">
//             <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">Need Custom Solutions?</h3>
//             <p className="text-lg text-primary-dark/80 mb-6 max-w-2xl mx-auto">
//               Our technical team specializes in developing customized chemical solutions to meet your specific
//               requirements and applications.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button onClick={() => navigate('/contact')} size="lg" className="font-semibold">
//                 Contact Our Experts
//               </Button>
//               <Button onClick={() => navigate('/products')} variant="outline" size="lg">
//                 View All Products
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductSegment;


import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Palette, Heart, Beaker, Sparkles } from 'lucide-react';

const categories = [
  {
    id: 'dyes-intermediates',
    title: 'Dyes & Intermediates',
    description:
      'Comprehensive range of acid dyes, basic dyes, reactive dyes, and chemical intermediates for textile and industrial applications.',
    icon: Palette,
    href: '/dyes-intermediates',
    color: 'from-blue-500 to-blue-600',
    products: ['Acid Dyes', 'Basic Dyes', 'Reactive Dyes', 'Direct Dyes', 'Solvent Dyes'],
  },
  {
    id: 'food-pharma',
    title: 'Food & Pharma Colors',
    description: 'FDA-approved food colors, pharmaceutical grades, and lake colors meeting international safety standards.',
    icon: Heart,
    href: '/food-pharma',
    color: 'from-green-500 to-green-600',
    products: ['Food Colors', 'Lake Colors', 'Pharma Grade', 'Natural Colors'],
  },
  {
    id: 'shades-pigments',
    title: 'Shades & Pigments',
    description:
      'High-performance pigments and colorants for paints, coatings, plastics, and printing applications.',
    icon: Beaker,
    href: '/shades-pigments',
    color: 'from-purple-500 to-purple-600',
    products: ['Organic Pigments', 'Inorganic Pigments', 'Special Effects', 'Dispersions'],
  },
  {
    id: 'varieties-cosmetics',
    title: 'Cosmetic Varieties',
    description: 'Safe and vibrant colors for cosmetics, personal care products, and beauty applications.',
    icon: Sparkles,
    href: '/varieties-cosmetics',
    color: 'from-pink-500 to-pink-600',
    products: ['Cosmetic Colors', 'Mica', 'Pearl Pigments', 'Special Effects'],
  },
];

const ProductSegment = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Product Segment</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our premium chemical product segments. Each category contains high-quality solutions tailored to
            industry needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              onClick={() => navigate(category.href)} // Entire card clickable
              className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">{category.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {category.products.map((product) => (
                      <span
                        key={product}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                      >
                        {product}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium text-sm">
                      Explore Products
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        navigate('/contact'); // Navigate to Contact page
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Request Sample
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-fade-in">
          <div className="bg-primary-light rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">Need Custom Solutions?</h3>
            <p className="text-lg text-primary-dark/80 mb-6 max-w-2xl mx-auto">
              Our technical team specializes in developing customized chemical solutions to meet your specific
              requirements and applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/contact')} size="lg" className="font-semibold">
                Contact Our Experts
              </Button>
              <Button onClick={() => navigate('/products')} variant="outline" size="lg">
                View All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSegment;
