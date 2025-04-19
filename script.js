document.addEventListener('DOMContentLoaded', function () {
    // Navigation handling
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show target section
            document.getElementById(targetId).style.display = 'block';

            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Show home section by default
    document.getElementById('home').style.display = 'block';

    // Form elements
    const resumeForm = document.getElementById('resume-form');
    const templateSelect = document.getElementById('template-select');
    const dynamicPrice = document.getElementById('dynamic-price');
    const finalPrice = document.getElementById('final-price');
    const paymentSection = document.getElementById('payment-section');
    const downloadSection = document.getElementById('download-section');
    const payButton = document.getElementById('pay-button');
    const paymentStatus = document.getElementById('payment-status');

    // Experience handling
    const experienceContainer = document.getElementById('experience-container');
    const addExperienceBtn = document.getElementById('add-experience');

    addExperienceBtn.addEventListener('click', function () {
        const newExperience = document.createElement('div');
        newExperience.className = 'experience-entry';
        newExperience.innerHTML = `
            <div class="form-group">
                <label>Job Title:*</label>
                <input type="text" name="job_title[]" required placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label>Company:*</label>
                <input type="text" name="company[]" required placeholder="Tech Corp">
            </div>
            <div class="form-group">
                <label>Duration (e.g., 2020-2023):*</label>
                <input type="text" name="duration[]" required placeholder="2020-2023">
            </div>
            <div class="form-group">
                <label>Key Responsibilities:*</label>
                <textarea name="responsibilities[]" required placeholder="Developed web applications..."></textarea>
            </div>
            <button type="button" class="remove-experience btn">Remove Job</button>
        `;
        experienceContainer.appendChild(newExperience);

        // Add event listener to remove button
        newExperience.querySelector('.remove-experience').addEventListener('click', function () {
            if (document.querySelectorAll('.experience-entry').length > 1) {
                experienceContainer.removeChild(newExperience);
                updatePrice();
            } else {
                alert('At least one job experience entry is required!');
            }
        });

        updatePrice();
    });

    // Education handling
    const educationContainer = document.getElementById('education-container');
    const addEducationBtn = document.getElementById('add-education');

    addEducationBtn.addEventListener('click', function () {
        const newEducation = document.createElement('div');
        newEducation.className = 'education-entry';
        newEducation.innerHTML = `
            <div class="form-group">
                <label>Degree:*</label>
                <input type="text" name="degree[]" required placeholder="B.Sc. Computer Science">
            </div>
            <div class="form-group">
                <label>University/Institution:*</label>
                <input type="text" name="university[]" required placeholder="XYZ University">
            </div>
            <div class="form-group">
                <label>Year of Graduation:*</label>
                <input type="number" name="graduation_year[]" required min="1900" max="2025" placeholder="2020">
            </div>
            <div class="form-group">
                <label>GPA/Percentage (Optional):</label>
                <input type="text" name="gpa[]" placeholder="3.8/4.0 or 85%">
            </div>
            <button type="button" class="remove-education btn">Remove Degree</button>
        `;
        educationContainer.appendChild(newEducation);

        // Add event listener to remove button
        newEducation.querySelector('.remove-education').addEventListener('click', function () {
            if (document.querySelectorAll('.education-entry').length > 1) {
                educationContainer.removeChild(newEducation);
                updatePrice();
            } else {
                alert('At least one education entry is required!');
            }
        });

        updatePrice();
    });

    // Price calculation
    function updatePrice() {
        const template = templateSelect.value;
        const experienceCount = document.querySelectorAll('.experience-entry').length;
        const educationCount = document.querySelectorAll('.education-entry').length;
        const skillsCount = document.getElementById('skills').value.split(',').filter(s => s.trim() !== '').length;

        let basePrice;
        switch (template) {
            case 'basic':
                basePrice = 5;
                break;
            case 'premium':
                basePrice = 10;
                break;
            case 'executive':
                basePrice = 15;
                break;
            default:
                basePrice = 5;
        }

        // Add ₹1 for each additional experience or education beyond the first
        basePrice += (experienceCount - 1) * 1 + (educationCount - 1) * 1;

        // Add ₹1 if more than 5 skills
        if (skillsCount > 5) {
            basePrice += 1;
        }

        // Cap prices based on template
        if (template === 'basic') basePrice = Math.min(basePrice, 7);
        else if (template === 'premium') basePrice = Math.min(basePrice, 12);
        else basePrice = Math.min(basePrice, 20);

        dynamicPrice.textContent = basePrice;
    }

    // Update price on template change or skills input
    templateSelect.addEventListener('change', updatePrice);
    document.getElementById('skills').addEventListener('input', updatePrice);

    // Form validation and submission
    resumeForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = resumeForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
                field.nextElementSibling?.remove(); // Remove existing error message
                const error = document.createElement('span');
                error.style.color = 'red';
                error.textContent = 'This field is required';
                field.parentElement.appendChild(error);
            } else {
                field.style.borderColor = '';
                field.nextElementSibling?.remove(); // Clear error message
            }
        });

        // Validate email format
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value && !emailRegex.test(email.value)) {
            isValid = false;
            email.style.borderColor = 'red';
            email.nextElementSibling?.remove();
            const error = document.createElement('span');
            error.style.color = 'red';
            error.textContent = 'Please enter a valid email';
            email.parentElement.appendChild(error);
        }

        // Validate phone format (basic check for 10 digits or international format)
        const phone = document.getElementById('phone');
        const phoneRegex = /^\+?\d{10,15}$/;
        if (phone.value && !phoneRegex.test(phone.value.replace(/\s/g, ''))) {
            isValid = false;
            phone.style.borderColor = 'red';
            phone.nextElementSibling?.remove();
            const error = document.createElement('span');
            error.style.color = 'red';
            error.textContent = 'Please enter a valid phone number';
            phone.parentElement.appendChild(error);
        }

        if (!isValid) {
            alert('Please correct the errors in the form.');
            return;
        }

        // Set final price and show payment section
        finalPrice.textContent = dynamicPrice.textContent;
        sections.forEach(section => (section.style.display = 'none'));
        paymentSection.style.display = 'block';
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Payment handling
    payButton.addEventListener('click', function () {
        const price = parseInt(finalPrice.textContent) * 100; // Convert to paise
        const email = document.getElementById('email').value;
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;

        paymentStatus.textContent = 'Initiating secure payment...';

        const options = {
            key: 'rzp_live_Apno0aW38JljQW', // Replace with test key for development
            amount: price,
            currency: 'INR',
            name: 'RetroResume.site',
            description: `Resume Generation - ${templateSelect.value.charAt(0).toUpperCase() + templateSelect.value.slice(1)} Plan`,
            image: 'logo.png', // Added logo for branding
            handler: function (response) {
                paymentStatus.textContent = 'Payment successful! Generating your resume...';
                saveResumeData(response.razorpay_payment_id);
            },
            prefill: {
                name: fullname,
                email: email,
                contact: phone.replace(/\s/g, '')
            },
            theme: {
                color: '#000080' // Retro navy blue
            },
            notes: {
                template: templateSelect.value,
                user_id: `user_${Date.now()}` // Unique user ID
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', function (response) {
            paymentStatus.textContent = `Payment failed: ${response.error.description}. Please try again or contact support.`;
        });
    });

    // Save resume data to JSONBin
    function saveResumeData(paymentId) {
        const formData = new FormData(resumeForm);
        const resumeData = {
            personal: {},
            education: [],
            experience: [],
            skills: {},
            additional: {},
            metadata: {
                payment_id: paymentId,
                timestamp: new Date().toISOString(),
                price: parseInt(finalPrice.textContent),
                template: templateSelect.value
            }
        };

        // Organize form data
        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                if (!resumeData[baseKey]) resumeData[baseKey] = [];
                resumeData[baseKey].push(value);
            } else if (['fullname', 'email', 'phone', 'address', 'linkedin'].includes(key)) {
                resumeData.personal[key] = value;
            } else if (['skills', 'soft_skills', 'certifications'].includes(key)) {
                resumeData.skills[key] = value;
            } else if (['projects', 'hobbies'].includes(key)) {
                resumeData.additional[key] = value;
            }
        });

        // Structure experience and education arrays
        const experienceEntries = document.querySelectorAll('.experience-entry');
        resumeData.experience = Array.from(experienceEntries).map(entry => ({
            job_title: entry.querySelector('[name="job_title[]"]').value,
            company: entry.querySelector('[name="company[]"]').value,
            duration: entry.querySelector('[name="duration[]"]').value,
            responsibilities: entry.querySelector('[name="responsibilities[]"]').value
        }));

        const educationEntries = document.querySelectorAll('.education-entry');
        resumeData.experience = Array.from(educationEntries).map(entry => ({
            degree: entry.querySelector('[name="degree[]"]').value,
            university: entry.querySelector('[name="university[]"]').value,
            graduation_year: entry.querySelector('[name="graduation_year[]"]').value,
            gpa: entry.querySelector('[name="gpa[]"]')?.value || ''
        }));

        // Save to JSONBin
        const binId = '67feb36f8561e97a500050ae';
        const apiKey = '$2a$10$b8W97yUA5bOJ1PmZhON/muwA0WWQupcEP9l9vkEKpRRovo4IMY19q';

        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey,
                'X-Bin-Name': `Resume_${paymentId}`
            },
            body: JSON.stringify(resumeData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to save resume data');
                return response.json();
            })
            .then(data => {
                generateDownloadLink(paymentId, resumeData);
            })
            .catch(error => {
                console.error('Error saving to JSONBin:', error);
                paymentStatus.textContent = 'Error saving your resume. Please contact support at support@retroresume.site.';
            });
    }

    // Generate download link (simulated PDF)
    function generateDownloadLink(paymentId, resumeData) {
        // Simulate PDF content (in reality, this would be server-side PDF generation)
        const resumeContent = `
            RetroResume.site - Professional Resume
            Template: ${resumeData.metadata.template.toUpperCase()}
            =========================================
            
            Personal Information:
            ---------------------
            Name: ${resumeData.personal.fullname}
            Email: ${resumeData.personal.email}
            Phone: ${resumeData.personal.phone}
            Address: ${resumeData.personal.address}
            LinkedIn: ${resumeData.personal.linkedin || 'N/A'}
            
            Education:
            ---------
            ${resumeData.education.map((edu, i) => `
            Education ${i + 1}:
            Degree: ${edu.degree}
            Institution: ${edu.university}
            Year: ${edu.graduation_year}
            GPA: ${edu.gpa || 'N/A'}
            `).join('\n')}
            
            Work Experience:
            ---------------
            ${resumeData.experience.map((exp, i) => `
            Job ${i + 1}:
            Title: ${exp.job_title}
            Company: ${exp.company}
            Duration: ${exp.duration}
            Responsibilities: ${exp.responsibilities}
            `).join('\n')}
            
            Skills:
            -------
            Technical: ${resumeData.skills.skills || 'None'}
            Soft Skills: ${resumeData.skills.soft_skills || 'None'}
            Certifications: ${resumData.skills.certifications || 'None'}
            
            Additional:
            -----------
            Projects: ${resumeData.additional.projects || 'None'}
            Hobbies: ${resumeData.additional.hobbies || 'None'}
            
            Payment ID: ${paymentId}
            Generated on: ${new Date().toLocaleString()}
        `;

        // Create Blob for download (simulating PDF)
        const blob = new Blob([resumeContent], { type: 'text/plain' }); // Replace with 'application/pdf' in real implementation
        const url = URL.createObjectURL(blob);

        // Set up download link
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = url;
        downloadLink.download = `RetroResume_${paymentId}.txt`; // Would be .pdf in real implementation

        // Show download section
        sections.forEach(section => (section.style.display = 'none'));
        downloadSection.style.display = 'block';
        downloadSection.scrollIntoView({ behavior: 'smooth' });

        // Auto-revoke URL after 24 hours
        setTimeout(() => URL.revokeObjectURL(url), 24 * 60 * 60 * 1000);

        // Send email notification
        sendEmailNotification(paymentId, resumeData.personal.email, resumeData.personal.fullname);
    }

    // Send email notification
    function sendEmailNotification(paymentId, email, fullname) {
        const formData = new FormData();
        formData.append('name', 'RetroResume.site');
        formData.append('email', 'noreply@retroresume.site');
        formData.append('subject', `Your Resume is Ready - Payment ID: ${paymentId}`);
        formData.append('message', `
            Dear ${fullname},
            
            Thank you for choosing RetroResume.site! Your resume has been generated successfully.
            
            Payment ID: ${paymentId}
            Amount: ₹${finalPrice.textContent}
            Template: ${templateSelect.value.charAt(0).toUpperCase() + templateSelect.value.slice(1)}
            
            Download your resume from the website (link expires in 24 hours).
            
            Need help? Contact us at support@retroresume.site.
            
            Best regards,
            The RetroResume.site Team
        `);
        formData.append('_replyto', email);

        fetch('https://formspree.io/f/xoveboqy', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) console.error('Error sending email notification');
            })
            .catch(error => {
                console.error('Error sending email notification:', error);
            });
    }

    // Initialize price on page load
    updatePrice();
});
