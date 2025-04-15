document.addEventListener('DOMContentLoaded', function() {
    // Navigation handling
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
    
    // Show home section by default
    document.getElementById('home').style.display = 'block';
    
    // Experience form handling
    const experienceContainer = document.getElementById('experience-container');
    const addExperienceBtn = document.getElementById('add-experience');
    
    addExperienceBtn.addEventListener('click', function() {
        const newExperience = document.createElement('div');
        newExperience.className = 'experience-entry';
        newExperience.innerHTML = `
            <div class="form-group">
                <label>Job Title:*</label>
                <input type="text" name="job_title[]" required>
            </div>
            <div class="form-group">
                <label>Company:*</label>
                <input type="text" name="company[]" required>
            </div>
            <div class="form-group">
                <label>Duration (Years):*</label>
                <input type="number" name="duration[]" required>
            </div>
            <div class="form-group">
                <label>Responsibilities:*</label>
                <textarea name="responsibilities[]" required></textarea>
            </div>
            <button type="button" class="remove-experience btn">Remove This Job</button>
        `;
        experienceContainer.appendChild(newExperience);
        
        // Add event listener to new remove button
        newExperience.querySelector('.remove-experience').addEventListener('click', function() {
            if (document.querySelectorAll('.experience-entry').length > 1) {
                experienceContainer.removeChild(newExperience);
                updatePrice();
            } else {
                alert('You must have at least one job experience entry!');
            }
        });
        
        updatePrice();
    });
    
    // Form submission handling
    const resumeForm = document.getElementById('resume-form');
    const submitResumeBtn = document.getElementById('submit-resume');
    const dynamicPrice = document.getElementById('dynamic-price');
    const finalPrice = document.getElementById('final-price');
    const paymentSection = document.getElementById('payment-section');
    const downloadSection = document.getElementById('download-section');
    
    // Price calculation
    function updatePrice() {
        const experienceCount = document.querySelectorAll('.experience-entry').length;
        const skillsCount = document.getElementById('skills').value.split(',').filter(s => s.trim() !== '').length;
        
        let price = 5; // Base price
        
        // Add ₹1 for each additional experience beyond first
        if (experienceCount > 1) {
            price += (experienceCount - 1);
        }
        
        // Add ₹1 if they have more than 5 skills
        if (skillsCount > 5) {
            price += 1;
        }
        
        // Cap at ₹10
        price = Math.min(price, 10);
        
        dynamicPrice.textContent = price;
    }
    
    // Update price when skills change
    document.getElementById('skills').addEventListener('input', updatePrice);
    
    // Form submission
    resumeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const requiredFields = resumeForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = '#ff00ff';
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Calculate final price
        const price = parseInt(dynamicPrice.textContent);
        finalPrice.textContent = price;
        
        // Hide form and show payment section
        resumeForm.style.display = 'none';
        paymentSection.style.display = 'block';
        
        // Scroll to payment section
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Payment handling
    const payButton = document.getElementById('pay-button');
    const paymentStatus = document.getElementById('payment-status');
    
    payButton.addEventListener('click', function() {
        const price = parseInt(finalPrice.textContent) * 100; // Convert to paise
        const email = document.getElementById('email').value;
        const fullname = document.getElementById('fullname').value;
        
        paymentStatus.textContent = 'Processing payment...';
        
        const options = {
            key: 'rzp_live_Apno0aW38JljQW',
            amount: price,
            currency: 'INR',
            name: 'RetroResume.site',
            description: 'Resume Generation Service',
            image: '', // No image as per requirements
            handler: function(response) {
                paymentStatus.textContent = 'Payment successful! Generating your resume...';
                
                // Save resume data to JSONBin
                saveResumeData(response.razorpay_payment_id);
            },
            prefill: {
                name: fullname,
                email: email,
                contact: document.getElementById('phone').value
            },
            theme: {
                color: '#000080'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
        rzp.on('payment.failed', function(response) {
            paymentStatus.textContent = 'Payment failed. Please try again. Error: ' + response.error.description;
        });
    });
    
    // Function to save resume data to JSONBin
    function saveResumeData(paymentId) {
        const formData = new FormData(resumeForm);
        const resumeData = {};
        
        // Convert FormData to object
        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                if (!resumeData[baseKey]) {
                    resumeData[baseKey] = [];
                }
                resumeData[baseKey].push(value);
            } else {
                resumeData[key] = value;
            }
        });
        
        // Add payment ID and timestamp
        resumeData.payment_id = paymentId;
        resumeData.timestamp = new Date().toISOString();
        resumeData.price = parseInt(finalPrice.textContent);
        
        // Prepare data for JSONBin
        const binId = '67feb36f8561e97a500050ae';
        const apiKey = '$2a$10$b8W97yUA5bOJ1PmZhON/muwA0WWQupcEP9l9vkEKpRRovo4IMY19q';
        
        fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey,
                'X-Bin-Name': 'RetroResume Data'
            },
            body: JSON.stringify(resumeData)
        })
        .then(response => response.json())
        .then(data => {
            // Generate download link
            generateDownloadLink(paymentId);
        })
        .catch(error => {
            console.error('Error saving to JSONBin:', error);
            paymentStatus.textContent = 'Error saving your data. Please contact support.';
        });
    }
    
    // Function to generate download link
    function generateDownloadLink(paymentId) {
        // In a real implementation, this would generate a PDF on the server
        // For this prototype, we'll simulate it with a data URL
        
        // Create a simple PDF content (in reality, this would be a proper PDF generation)
        const resumeContent = `
            RetroResume.site - Your Professional Resume
            =========================================
            
            Personal Information:
            ---------------------
            Name: ${document.getElementById('fullname').value}
            Email: ${document.getElementById('email').value}
            Phone: ${document.getElementById('phone').value}
            Address: ${document.getElementById('address').value}
            
            Education:
            ---------
            Degree: ${document.getElementById('highest_degree').value}
            Institution: ${document.getElementById('university').value}
            Year: ${document.getElementById('graduation_year').value}
            
            Work Experience:
            ---------------
            ${Array.from(document.querySelectorAll('.experience-entry')).map((exp, i) => `
            Job ${i+1}:
            Title: ${exp.querySelector('[name="job_title[]"]').value}
            Company: ${exp.querySelector('[name="company[]"]').value}
            Duration: ${exp.querySelector('[name="duration[]"]').value} years
            Responsibilities: ${exp.querySelector('[name="responsibilities[]"]').value}
            `).join('\n')}
            
            Skills:
            ------
            ${document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s).join(', ')}
            
            Payment ID: ${paymentId}
            Generated on: ${new Date().toLocaleString()}
        `;
        
        // Create a Blob with the content (simulating PDF)
        const blob = new Blob([resumeContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Set up download link
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = url;
        downloadLink.download = `RetroResume_${paymentId}.txt`; // Would be .pdf in real implementation
        
        // Show download section
        paymentSection.style.display = 'none';
        downloadSection.style.display = 'block';
        downloadSection.scrollIntoView({ behavior: 'smooth' });
        
        // Send email notification via Formspree
        sendEmailNotification(paymentId, url);
    }
    
    // Function to send email notification
    function sendEmailNotification(paymentId, downloadUrl) {
        const email = document.getElementById('email').value;
        const fullname = document.getElementById('fullname').value;
        
        const formData = new FormData();
        formData.append('name', 'RetroResume.site');
        formData.append('email', 'noreply@retroresume.site');
        formData.append('subject', `Your Resume is Ready - Payment ID: ${paymentId}`);
        formData.append('message', `
            Dear ${fullname},
            
            Thank you for using RetroResume.site! Your resume has been successfully generated.
            
            Payment ID: ${paymentId}
            Amount: ₹${finalPrice.textContent}
            
            You can download your resume here: ${downloadUrl}
            
            This link will expire in 24 hours.
            
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
            if (!response.ok) {
                console.error('Error sending email notification');
            }
        })
        .catch(error => {
            console.error('Error sending email notification:', error);
        });
    }
    
    // Initialize price
    updatePrice();
});
