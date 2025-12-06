#let resume_data = json(bytes(sys.inputs.resume_data))

// --- Configuration ---
#let accent_color = rgb("#dc3545") // Awesome CV Red
#let text_color = rgb("#333333")
#let gray_color = rgb("#5d5d5d")
#let light_gray_color = rgb("#999999")

#let body_font = ("Roboto", "Arial", "Source Sans Pro", "sans-serif")
#let title_font = ("Roboto", "Arial", "Source Sans Pro", "sans-serif")

#set page(
  margin: (x: 1cm, y: 1cm), // Reduced margins
  numbering: none,
)

#set text(
  font: body_font,
  size: 9pt, // Reduced font size
  fill: text_color,
)

// --- Utils ---
#let remove_bullets(content) = {
  // Use regex to remove leading bullets (•, -, *) and following whitespace
  // ^ matches start of string
  // [•\-\*] matches any of these characters
  // \s* matches any whitespace
  let str_content = str(content)
  str_content.replace(regex("^[\s•\-\*]+"), "").trim()
}

#let section_title(title) = {
  v(2pt) // Reduced spacing
  text(font: title_font, weight: "bold", size: 12pt, fill: text_color)[#title] // Serif title
  h(1fr)
  line(length: 100%, stroke: 0.5pt + light_gray_color)
  v(2pt) // Reduced spacing
}

#let entry_header(title, subtitle, date, location) = {
  grid(
    columns: (1fr, auto),
    row-gutter: 2pt,
    // Tighter gutter
    align(left)[
      #text(font: title_font, weight: "bold", size: 10pt)[#title] // Serif header
      #if subtitle != "" [ \ #text(style: "italic", fill: gray_color, size: 8.5pt)[#subtitle] ]
    ],
    align(right)[
      #if date != "" [ #text(fill: accent_color, size: 8.5pt)[#date] \ ]
      #if location != "" [ #text(style: "italic", size: 8.5pt, fill: gray_color)[#location] ]
    ],
  )
}

#let skill_tag(tag) = {
  box(
    inset: (x: 4pt, y: 2pt), // Smaller padding
    outset: 0pt,
    radius: 2pt,
    fill: light_gray_color.lighten(80%),
    text(size: 7.5pt, fill: text_color)[#tag], // Smaller text
  )
}

// --- Header ---
#align(center)[
  #text(font: title_font, weight: "bold", size: 20pt)[#resume_data.contact_info.name] // Serif name
  \
  #v(3pt)
  #text(size: 8.5pt, fill: gray_color)[
    #if resume_data.contact_info.phone != none [ #resume_data.contact_info.phone | ]
    #if (
      resume_data.contact_info.email != none
    ) [ #link("mailto:" + resume_data.contact_info.email)[#resume_data.contact_info.email] | ]
    #if (
      resume_data.contact_info.website != none
    ) [ #link("https://" + resume_data.contact_info.website)[#resume_data.contact_info.website] | ]
    #if resume_data.contact_info.linkedin != none [ #link(resume_data.contact_info.linkedin)[LinkedIn] ]
  ]
]

// --- Summary ---
#if "summary" in resume_data {
  section_title("Summary")
  par(justify: true, leading: 0.5em)[#resume_data.summary] // Tighter leading
}

// --- Experience ---
#if "work_experience" in resume_data {
  section_title("Experience")
  for job in resume_data.work_experience {
    entry_header(job.role, job.company, job.start_date + " - " + job.end_date, "")
    v(2pt)
    if "responsibilities" in job {
      for resp in job.responsibilities {
        list(marker: [•], indent: 8pt, body-indent: 4pt, spacing: 0.5em)[#remove_bullets(resp)]
      }
    }
    v(4pt) // Reduced spacing between jobs
  }
}

// --- Projects ---
#if "projects" in resume_data {
  section_title("Projects")
  for proj in resume_data.projects {
    entry_header(proj.name, proj.role, proj.date, proj.tech_stack)
    v(2pt)
    if "details" in proj {
      for detail in proj.details {
        list(indent: 8pt, body-indent: 4pt, spacing: 0.5em)[#remove_bullets(detail)]
      }
    }
    v(4pt)
  }
}

// --- Education ---
#if "education" in resume_data {
  section_title("Education")
  for edu in resume_data.education {
    entry_header(edu.degree, edu.institution, edu.graduation_date, "")
    v(4pt)
  }
}

// --- Skills ---
#if "skills" in resume_data {
  section_title("Skills")
  if "technical" in resume_data.skills {
    text(weight: "bold", size: 9pt)[Technical Skills:]
    v(2pt)
    resume_data.skills.technical.map(s => skill_tag(s)).join(" ")
    v(4pt)
  }
  if "soft" in resume_data.skills {
    text(weight: "bold", size: 9pt)[Soft Skills:]
    v(2pt)
    resume_data.skills.soft.map(s => skill_tag(s)).join(" ")
  }
}

// --- Languages ---
#if "languages" in resume_data {
  section_title("Languages")
  resume_data.languages.map(l => [*#l.name*: #l.level]).join(" | ")
}
