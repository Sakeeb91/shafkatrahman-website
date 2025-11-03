# Chapter 9: The First Model of the World

### **Chapter Overview:**

- **Main Focus:** This chapter explores the brain's remarkable ability to create internal models of the external world, a capacity that Bennett argues is a defining feature of vertebrate intelligence. These models enable spatial navigation, planning, and a deeper understanding of the environment. This internal model is the foundation for ‘seeing’ the world rather than just ‘sensing’ it, which Bennett claims is what sets vertebrates apart from invertebrates (Bennett, 2023, p. 147).
- **Objectives:**
    - Explain what internal models are and why they are important.
    - Demonstrate how even simple vertebrate brains, like those of fish, can create spatial maps.
    - Introduce the hippocampus and its role in spatial navigation.
    - Contrast the navigational strategies of vertebrates with those of invertebrates like ants.
    - Highlight the evolutionary significance of internal models as a foundation for higher-level cognition.
- **Fit into Book's Structure:** This chapter builds upon previous discussions of steering, reinforcement learning, and pattern recognition, showing how these abilities contribute to the creation of internal models. It lays the groundwork for the subsequent chapters on the neocortex and its role in simulation and mentalizing.

### **Key Terms and Concepts:**

- **Internal Model:** A mental representation of the external world, including spatial relationships, objects, and events. Relevance: This is the central concept of the chapter, presented as a crucial aspect of vertebrate intelligence.
- **Spatial Map:** A type of internal model that represents the layout of an environment. Relevance: Spatial maps enable navigation and planning.
- **Hippocampus:** A brain region involved in spatial navigation, memory, and learning. Relevance: The hippocampus is presented as the primary structure for constructing and storing spatial maps in vertebrates.
- **Place Cells:** Neurons in the hippocampus that fire when an animal is in a specific location. Relevance: These cells provide evidence for the existence of spatial maps in the brain.
- **Head-Direction Cells:** Neurons that fire when an animal's head is pointing in a specific direction. Relevance: These cells, in conjunction with place cells, contribute to the brain's internal compass.
- **Vestibular System:** The sensory system that provides information about balance, motion, and spatial orientation. Relevance: The vestibular system provides crucial input for the creation of spatial maps.
- **Detour Task:** An experimental task used to assess spatial navigation abilities. Relevance: This task demonstrates the difference between navigating with a spatial map and simply following a sequence of learned movements.

### **Key Figures:**

- **Edward C. Tolman:** A psychologist who proposed the concept of cognitive maps. Relevance: Tolman's work provided early evidence for the existence of internal models in animals. Bennett suggests that Tolman’s rats were using similar ‘maps’ when they were able to successfully navigate to food using spatial reasoning, not just rote memorization (Bennett, 2023, p. 156).

### **Central Thesis and Supporting Arguments:**

- **Central Thesis:** Vertebrates, unlike many invertebrates, have evolved the capacity to create internal models of the world, which enable sophisticated spatial navigation, planning, and a deeper understanding of their environment.
- **Supporting Arguments:**
    - **Spatial navigation in fish:** Experiments with fish demonstrate their ability to learn and remember locations within a tank, even in the absence of visual cues (Bennett, 2023, p. 146-147), suggesting the existence of spatial maps.
    - **Role of the hippocampus:** Damage to the hippocampus impairs spatial navigation in various vertebrate species, including fish, rodents, and humans.
    - **Place cells and head-direction cells:** These specialized neurons provide direct evidence for the neural representation of spatial information in the brain. The author mentions that damage to the hippocampus similarly affects spatial navigation in humans and other animals, suggesting that the hippocampus indeed plays a fundamental role in generating such spatial maps (Bennett, 2023, p. 150).
    - **Contrast with invertebrates:** Invertebrates like ants rely on different navigational strategies, such as path integration and landmark recognition, which do not require the construction of an internal model. Bennett uses an example of an ant study where ants repeatedly and unnecessarily retrace their steps to demonstrate how ants are not using an internal model of the world (Bennett, 2023, p. 147).
    - **Evolutionary advantage:** Internal models provide a significant evolutionary advantage by enabling flexible behavior, planning, and adaptation to changing environments.

### **Observations and Insights:**

- **The importance of self-other distinction:** Creating a spatial map requires the brain to distinguish between "self" (the animal's own body and location) and "other" (the external environment).
- **Internal models as predictive tools:** These models are not just static representations, but also enable predictions about future events and the consequences of actions.

### **Unique Interpretations and Unconventional Ideas:**

- **The emphasis on the distinction between vertebrate and invertebrate navigational strategies:** Bennett highlights how different evolutionary pressures and ecological niches lead to distinct forms of intelligence.

### **Problems and Solutions:**

| Problem/Challenge | Proposed Solution/Approach | Page/Section Reference |
| --- | --- | --- |
| Navigating complex environments without visual cues | Construction of spatial maps | 146-147 |
| Maintaining orientation and direction | Vestibular system, head-direction cells | 148-149 |
| Representing spatial relationships between objects and locations | Hippocampus, place cells | 149-151 |

### **Categorical Items:**

Bennett implicitly categorizes different navigational strategies (spatial maps vs. path integration) and relates them to different levels of cognitive sophistication.

### **Literature and References:**

- Works by Tolman and others are cited.
- Studies on spatial navigation in fish, rodents, ants, and other animals are referenced.

### **Areas for Further Research:**

- The precise mechanisms by which the hippocampus constructs and updates spatial maps are still being investigated.
- The role of other brain regions in spatial navigation and planning requires further exploration.
- The development of spatial abilities across the lifespan and in different species is an open question.

### **Critical Analysis:**

- **Strengths:** The chapter clearly explains the importance of internal models in vertebrate intelligence and provides compelling evidence for their existence. The contrast with invertebrate navigational strategies is insightful.
- **Weaknesses:** The chapter focuses primarily on spatial navigation, and the discussion of other types of internal models (e.g., models of social relationships or object properties) is limited.

### **Practical Applications:**

- Understanding how the brain creates internal models can inspire new approaches to robotics and artificial intelligence, particularly in the development of navigation systems and autonomous agents.

### **Connections to Other Chapters:**

- Chapter 2 (Birth of Good and Bad): The evolution of valence in bilaterians provided the fundamental “vote” by which to *steer* towards things in the world labeled as “good’ and away from things labeled as ‘bad’ (Bennett, 2023, p. 43). This was an important prerequisite for developing a spatial map, since it enables organisms to recognize locations with historically positive or negative valence outcomes, thereby adding information to the map beyond simply locations of different landmarks. This integration of valence and location into a single internal model lays the foundation for later discussion of ‘intent’ (Ch. 12 & 13), whereby an animal wants to go to a specific place because they expect they will derive some benefit once they are at that place.
- Chapter 6 (TD Learning): Internal models enable animals to simulate different scenarios and predict the consequences of their actions, which is crucial for *temporal difference learning*. A model of the world is a prerequisite for model-based temporal difference learning algorithms (Ch. 13), since it is the model of the world which allows an animal or AI to simulate the consequences of a particular action. This also highlights the limitations of simpler forms of model-free TD learning which lack an ability to simulate different future scenarios (Bennett, 2023, p. 147).
- Chapter 7 (Pattern Recognition): The ability to recognize patterns is essential for constructing accurate internal models of the world. Recognizing, for instance, a dangerous predator requires both seeing the visual pattern of the predator itself (via mechanisms discussed in Ch. 7), and also remembering the locations in which that predator tends to show up. This is also what may differentiate primate pattern recognition from that of other animals. A primate may have more neocortex dedicated to identifying individual humans in their social groups, and remembering these individuals’ intentions (Ch. 16 & 17), rather than identifying types of predators.
- Chapter 11, 12, and 13: This chapter directly foreshadows the importance of the neocortex in enabling *simulation* (Ch. 11, 12, & 13), since it is the neocortex’s ability to ‘imagine’ the world as it is not that enables the next level sophistication in the evolution of intelligence. This chapter lays the framework by demonstrating that the ability of brains to create an internal model of the world emerged prior to the evolution of the neocortex. And, therefore, the author suggests that what the neocortex enables is not an entirely new function but rather some sort of ‘upgrade’ to an existing function—a transition of an animal’s brain from a ‘model’ of its world to a ‘simulator’ of its world (Bennett, 2023, p. 151).

### **Surprising, Interesting, and Novel Ideas:**

- **Fish having sophisticated spatial navigation abilities:** Bennett's examples of fish learning and remembering locations challenge the common perception of fish as having limited cognitive abilities (Bennett, 2023, p. 146-147).
- **The distinction between vertebrate and invertebrate navigation:** The contrast between vertebrates using spatial maps and invertebrates relying on path integration highlights how different ecological pressures can lead to distinct forms of intelligence (Bennett, 2023, p. 147).
- **The idea that internal models of the world are a *precursor* to *simulating* those models:** This lays the groundwork for Bennett’s later discussion of the neocortex and highlights how even early brains were already creating simulated worlds long before they could simulate futures and pasts (Bennett, 2023, p. 151).

### **Discussion Questions:**

- What are the advantages and disadvantages of different navigational strategies used by animals?
- How might the concept of internal models be applied to understand human cognition and behavior in areas beyond spatial navigation?
- What are the ethical implications of creating AI systems with detailed internal models of the world?
- How does the brain's ability to create internal models contribute to our sense of self and our understanding of others?
- How might understanding the neural mechanisms of spatial navigation inform the development of new technologies for navigation and mapping?

### **Visual Representation:**

[Sensory Input (Vision, Vestibular System)] --> [Hippocampus (Place Cells, Head-Direction Cells)] --> [Internal Model (Spatial Map)] --> [Navigation & Planning]

### TL;DR

<aside>
📌

Vertebrate brains don't just *react* to the world; they *model* it.  Unlike ants following rote routines, fish and other vertebrates build internal *spatial maps*, remembering locations relative to landmarks (Bennett, 2023, p. 147).  This "find your way home in the dark" ability requires the *hippocampus*, which contains specialized "place cells" that fire when in a specific location (Bennett, 2023, p. 149-150).  The *vestibular system* provides a sense of balance and direction, creating an inner compass using *head-direction neurons* (Bennett, 2023, p. 148-149). This internal model of space goes beyond simple *pattern recognition* (Ch. 7), enabling *prediction* (Ch. 6 & 11) and planning. Key ideas:  internal models as a foundation for vertebrate intelligence, the hippocampus as a spatial mapmaker, and the contrast between vertebrate and invertebrate navigation. Core philosophy: Intelligence is about building accurate, flexible representations of the world, enabling more sophisticated *steering* (Ch. 2) decisions than simple *reinforcement* (Ch. 2 & 6) alone. This sets the stage for the neocortex's *simulations* (Ch. 11, 12, & 13) and the emergence of abstract thought in mammals by showing how basic model creation for navigating the world predates any such *simulating* (Ch. 3) abilities.  (Bennett, 2023, pp. 156-162)

</aside>